import fs from 'fs';
import path from 'path';

const FILES = [
  'figma/tokens.primitive.json',
  'figma/tokens.semantic.json',
  'figma/tokens.components.json'
];

/**
 * Resolves a variable value, including aliases and color objects.
 */
function resolveValue(variable, allVariables, modeId) {
  const value = variable.valuesByMode[modeId] || Object.values(variable.valuesByMode)[0];
  
  if (value && typeof value === 'object' && value.type === 'VARIABLE_ALIAS') {
    const aliasedVar = allVariables[value.id];
    if (aliasedVar) {
      return resolveValue(aliasedVar, allVariables, modeId);
    }
    // Fallback if alias not found in the provided sets
    return `var(--token-alias-${value.id.replace(/:/g, '-')})`;
  }
  
  // Handle Figma Color objects {r, g, b, a}
  if (typeof value === 'object' && value !== null && 'r' in value) {
    const r = Math.round(value.r * 255);
    const g = Math.round(value.g * 255);
    const b = Math.round(value.b * 255);
    const a = value.a;
    if (a === 1) {
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
  }
  
  // Handle font weights
  if (variable.name.toLowerCase().includes('weight') && typeof value === 'string') {
    const weights = {
      'thin': 100,
      'extra-light': 200,
      'light': 300,
      'regular': 400,
      'medium': 500,
      'semibold': 600,
      'bold': 700,
      'extra-bold': 800,
      'black': 900
    };
    return weights[value.toLowerCase()] || value;
  }

  // Handle numbers (e.g. for spacing or font size)
  if (typeof value === 'number') {
    // Detect if it should be degrees (rotation) or generic px
    if (variable.name.toLowerCase().includes('rotation')) return `${value}deg`;
    if (value === 0) return '0';
    return `${value}px`;
  }

  return value;
}

async function transform() {
  console.log('🏗️ Transforming Figma tokens to CSS...');
  
  const allVariables = {};
  const variableSource = {}; // Track which file each variable came from
  const collections = {};
  
  // 1. Gather all data
  for (const file of FILES) {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Warning: ${filePath} not found, skipping.`);
      continue;
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (data.meta && data.meta.variables) {
      for (const [id, variable] of Object.entries(data.meta.variables)) {
        if (!allVariables[id]) {
            allVariables[id] = variable;
            variableSource[id] = file;
        }
      }
    }
    if (data.meta && data.meta.variableCollections) {
      Object.assign(collections, data.meta.variableCollections);
    }
  }

  let css = '/**\n * Auto-generated Design Tokens\n * Source: Figma Variables\n */\n\n:root {\n';
  
  // 2. Process variables and map to CSS variables
  const processedNames = new Set();

  for (const [id, variable] of Object.entries(allVariables)) {
    const collection = collections[variable.variableCollectionId];
    if (!collection) continue;

    const sourceFile = path.basename(variableSource[id] || '');
    const modeId = collection.defaultModeId || collection.modes[0].modeId;
    let value = resolveValue(variable, allVariables, modeId);
    
    let normalizedName = variable.name.toLowerCase().replace(/[\/\s]/g, '-');
    let cssName = '';
    const collectionName = collection.name.toLowerCase();

    // 2a. Determine base name by collection
    if (collectionName === 'key' || collectionName === 'colors') {
      cssName = `--kds-sys-color-${normalizedName}`;
    } else if (collectionName === 'typography' || collectionName === 'typescale') {
      cssName = `--kds-typography-${normalizedName}`;
    } else if (collectionName === 'space') {
      cssName = `--kds-sys-space-${normalizedName}`;
    } else if (collectionName === 'components') {
      cssName = `--kds-comp-${normalizedName}`;
    } else if (collectionName === 'states') {
      cssName = `--kds-state-${normalizedName}`;
    } else {
      cssName = `--kds-${collectionName}-${normalizedName}`;
    }

    // 2b. Manual overrides (ONLY for non-component/non-state tokens to match external contracts)
    const isComponentSource = sourceFile === 'tokens.components.json';
    const isComponentColl = collectionName === 'components';
    const isStateColl = collectionName === 'states';

    const extractAlpha = (val) => {
        if (typeof val !== 'string') return val;
        const match = val.match(/rgba\(.*,\s*([\d.]+)\)/);
        return match ? match[1] : val;
    };

    // If it's a component-related token from the component source, preserve it strictly
    if (isComponentSource && (isComponentColl || isStateColl)) {
        cssName = `--kds-comp-${normalizedName}`;
        if (normalizedName.includes('opacity')) {
            value = extractAlpha(value);
        }
    } else if (collectionName !== 'components') {
        // Global system overrides
        if (normalizedName === 'primary') cssName = '--kds-sys-color-primary';
        if (normalizedName === 'on-primary') cssName = '--kds-sys-color-on-primary';
        if (normalizedName === 'secondary-container') cssName = '--kds-sys-color-secondary-container';
        if (normalizedName === 'on-surface-variant') cssName = '--kds-sys-color-on-surface-variant';
        
        if (normalizedName.includes('hover') && normalizedName.includes('opacity')) {
          cssName = '--kds-state-layer-opacity-hover';
          value = extractAlpha(value);
        } else if (normalizedName.includes('focus') && normalizedName.includes('opacity')) {
          cssName = '--kds-state-layer-opacity-focus';
          value = extractAlpha(value);
        } else if (normalizedName.includes('press') && normalizedName.includes('opacity')) {
          cssName = '--kds-state-layer-opacity-press';
          value = extractAlpha(value);
        } else if (normalizedName.endsWith('opacity-08')) {
          cssName = '--kds-state-layer-opacity-hover';
          value = extractAlpha(value);
        } else if (normalizedName.endsWith('opacity-12')) {
          cssName = '--kds-state-layer-opacity-focus';
          value = extractAlpha(value);
        } else if (normalizedName.endsWith('opacity-16')) {
          cssName = '--kds-state-layer-opacity-press';
          value = extractAlpha(value);
        }
    }

    if (!processedNames.has(cssName)) {
      css += `  ${cssName}: ${value};\n`;
      processedNames.add(cssName);
    }
  }
  
  css += '}\n';
  
  // Ensure directory exists
  const dir = 'src/styles';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  fs.writeFileSync(path.join(dir, 'tokens.css'), css);
  console.log('✨ All tokens published to src/styles/tokens.css');
}

transform().catch(console.error);
