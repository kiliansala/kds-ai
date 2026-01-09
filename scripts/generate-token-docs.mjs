import fs from 'fs';
import path from 'path';

const TOKEN_FILES = {
  Primitives: 'tokens.primitive.json',
  Semantic: 'tokens.semantic.json',
  Components: 'tokens.components.json'
};

const COMPONENT_CONTRACT = 'contracts/component-definitions.json';
const OUTPUT_DIR = 'src/tokens';
const COMPONENT_DIR = 'src/components';

let allVariables = {}; 

function rgbaToHex({ r, g, b, a }) {
  const toHex = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  if (a !== undefined && a < 1) {
    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a.toFixed(2)})`;
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function getShortId(id) {
  if (!id) return id;
  const parts = id.split(':');
  if (parts.length > 1) {
    const lastNum = parts.pop();
    const midNum = parts.pop().split('/').pop();
    return `${midNum}:${lastNum}`;
  }
  return id;
}

function getCssVarName(variable, collection, sourceFile) {
  if (!variable || !collection) return '--kds-unknown';
  let normalizedName = variable.name.toLowerCase().replace(/[\/\s]/g, '-');
  let cssName = '';
  const collectionName = collection.name.toLowerCase();

  // Pattern Match Logic (Must match transform-tokens.mjs)
  const isComponentSource = sourceFile === 'tokens.components.json';
  const isComponentColl = collectionName === 'components';
  const isStateColl = collectionName === 'states';

  if (isComponentSource && (isComponentColl || isStateColl)) {
    cssName = `--kds-comp-${normalizedName}`;
  } else if (collectionName === 'key' || collectionName === 'colors') {
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

  // Contract Overrides (ONLY for non-component source)
  if (!isComponentSource) {
      if (normalizedName === 'primary') cssName = '--kds-sys-color-primary';
      if (normalizedName === 'on-primary') cssName = '--kds-sys-color-on-primary';
      if (normalizedName === 'secondary-container') cssName = '--kds-sys-color-secondary-container';
      if (normalizedName === 'on-surface-variant') cssName = '--kds-sys-color-on-surface-variant';
      
      if (normalizedName.endsWith('opacity-08') || (normalizedName.includes('hover') && normalizedName.includes('opacity'))) {
        cssName = '--kds-state-layer-opacity-hover';
      } else if (normalizedName.endsWith('opacity-12') || (normalizedName.includes('focus') && normalizedName.includes('opacity'))) {
        cssName = '--kds-state-layer-opacity-focus';
      } else if (normalizedName.endsWith('opacity-16') || (normalizedName.includes('press') && normalizedName.includes('opacity'))) {
        cssName = '--kds-state-layer-opacity-press';
      }
  }

  return cssName;
}

function resolveValueRecursive(variable, modeId) {
  if (!variable) return '—';
  const valObj = variable.valuesByMode[modeId] || Object.values(variable.valuesByMode)[0];
  
  if (valObj && typeof valObj === 'object' && valObj.type === 'VARIABLE_ALIAS') {
    const shortId = getShortId(valObj.id);
    const aliasedVar = allVariables[shortId];
    if (aliasedVar) return resolveValueRecursive(aliasedVar, modeId);
    return 'Alias'; 
  }
  
  if (typeof valObj === 'object' && valObj !== null && 'r' in valObj) {
    return rgbaToHex(valObj);
  }

  if (variable.name.toLowerCase().includes('weight') && typeof valObj === 'string') {
    const weights = { thin: 100, light: 300, regular: 400, medium: 500, semibold: 600, bold: 700, black: 900 };
    return weights[valObj.toLowerCase()] || valObj;
  }

  if (typeof valObj === 'number') return valObj === 0 ? '0' : `${valObj}px`;

  return valObj !== undefined ? valObj : '—';
}

function getVariableByCssName(cssName) {
    const target = cssName.startsWith('--') ? cssName : `--${cssName}`;
    for (const file of Object.values(TOKEN_FILES)) {
        const filePath = path.join(process.cwd(), file);
        if (!fs.existsSync(filePath)) continue;
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const collections = data.meta.variableCollections;
        for (const coll of Object.values(collections)) {
            for (const vid of coll.variableIds) {
                const v = allVariables[getShortId(vid)];
                if (v && getCssVarName(v, coll, v.sourceFile) === target) return { variable: v, collection: coll };
            }
        }
    }
    return null;
}

/**
 * Generates a clean, simplified token table for Storybook docs.
 * Using HTML table to prevent MDX parsing issues and match Playground style.
 */
function generateTokenTable(tokenList) {
    if (!tokenList || tokenList.length === 0) return '<p>No tokens used.</p>';
    
    let html = `
<table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', marginBottom: '2rem', fontSize: '14px' }}>
    <thead>
        <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left', color: '#999', textTransform: 'uppercase', fontSize: '11px' }}>
            <th style={{ padding: '12px 0' }}>Token Name</th>
            <th style={{ padding: '12px 0' }}>Light</th>
            <th style={{ padding: '12px 0' }}>Dark</th>
            <th style={{ padding: '12px 0' }}>CSS Variable</th>
        </tr>
    </thead>
    <tbody>`;

    tokenList.forEach(tName => {
        const res = getVariableByCssName(tName);
        if (!res) {
            html += `
        <tr style={{ borderBottom: '1px solid #f9f9f9' }}>
            <td style={{ padding: '16px 0' }}><strong>${tName}</strong></td>
            <td colspan="2" style={{ padding: '16px 0', color: '#999' }}><em>Not found</em></td>
            <td style={{ padding: '16px 0' }}><code>${tName}</code></td>
        </tr>`;
            return;
        }
        const { variable, collection } = res;
        const modes = collection.modes;
        const isColor = variable.resolvedType === 'COLOR';
        const name = variable.name.split('/').pop();
        const path = variable.name.split('/').slice(0, -1).join('/');

        const lightVal = resolveValueRecursive(variable, modes[0].modeId);
        const darkVal = modes.length > 1 ? resolveValueRecursive(variable, modes[1].modeId) : lightVal;

        const swatch = (val) => isColor ? `<div style={{ width: '14px', height: '14px', background: '${val}', border: '1px solid #eee', borderRadius: '3px', marginRight: '8px' }}></div>` : '';

        html += `
        <tr style={{ borderBottom: '1px solid #f9f9f9' }}>
            <td style={{ padding: '16px 0' }}>
                <div style={{ fontWeight: '600', color: '#1a1a1b' }}>${name}</div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>${path}</div>
            </td>
            <td style={{ padding: '16px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    ${swatch(lightVal)}
                    <code style={{ fontSize: '12px', color: '#e83e8c', background: '#f8f9fa', padding: '2px 4px', borderRadius: '3px' }}>${lightVal}</code>
                </div>
            </td>
            <td style={{ padding: '16px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    ${swatch(darkVal)}
                    <code style={{ fontSize: '12px', color: '#e83e8c', background: '#f8f9fa', padding: '2px 4px', borderRadius: '3px' }}>${darkVal}</code>
                </div>
            </td>
            <td style={{ padding: '16px 0' }}>
                <code style={{ fontSize: '12px', color: '#666', background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' }}>${tName.startsWith('--') ? tName : `--${tName}`}</code>
            </td>
        </tr>`;
    });

    html += `
    </tbody>
</table>`;

    return html;
}

function generateComponentMDX(comp) {
    const storyFile = `${comp.tag}.stories`;
    let mdx = `import { Meta, Title, Subtitle, Description, Primary, Controls } from '@storybook/blocks';\n`;
    mdx += `import * as ${comp.name}Stories from './${storyFile}';\n\n`;
    mdx += `<Meta of={${comp.name}Stories} />\n\n`;
    mdx += `<Title />\n`;
    mdx += `<Subtitle />\n`;
    mdx += `<Description />\n\n`;
    mdx += `## Interactive Playground\n\n`;
    mdx += `<Primary />\n`;
    mdx += `<Controls />\n\n`;
    mdx += `## Design Tokens\n\n`;
    mdx += `This component uses these tokens for its visual definition. See the [full specification in the Playground](?path=/docs/tokens-overview--docs).\n\n`;
    mdx += generateTokenTable(comp.tokens);
    mdx += `\n\n`;
    
    return mdx;
}

async function run() {
  // 1. Gather all variables
  for (const file of Object.values(TOKEN_FILES)) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      for (const [id, variable] of Object.entries(data.meta.variables)) {
        const sid = getShortId(id);
        allVariables[sid] = variable;
        allVariables[sid].sourceFile = file;
      }
    }
  }

  // 2. Clean up old Global MDX files (User wants them gone)
  ['Primitives', 'Semantic', 'Components', 'Overview'].forEach(title => {
      const p = path.join(OUTPUT_DIR, `${title}.mdx`);
      if (fs.existsSync(p)) {
          fs.unlinkSync(p);
          console.log(`Removed global token page: ${p}`);
      }
  });

  // 3. Update tokens-data.json for Playground
  const playgroundData = { allVariables };
  for (const [title, fileName] of Object.entries(TOKEN_FILES)) {
    const filePath = path.join(process.cwd(), fileName);
    if (!fs.existsSync(filePath)) continue;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Enrich variables with cssName for Playground consumption
    if (data.meta && data.meta.variables) {
        for (const [id, variable] of Object.entries(data.meta.variables)) {
            const sid = getShortId(id);
            const coll = data.meta.variableCollections[variable.variableCollectionId];
            if (coll) {
                // We use the fileName mapped in TOKEN_FILES
                variable.cssName = getCssVarName(variable, coll, fileName);
                // Also update in allVariables for easy lookup
                if (allVariables[sid]) allVariables[sid].cssName = variable.cssName;
            }
        }
    }

    playgroundData[title] = {
        collections: data.meta.variableCollections,
        variables: data.meta.variables
    };
  }
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'tokens-data.json'), JSON.stringify(playgroundData, null, 2));

  // 4. Generate Component Documentation (only for those with stories)
  if (fs.existsSync(COMPONENT_CONTRACT)) {
      const contract = JSON.parse(fs.readFileSync(COMPONENT_CONTRACT, 'utf8'));
      
      // Clear current component MDX files to avoid orphans
      const mdxFiles = fs.readdirSync(COMPONENT_DIR).filter(f => f.endsWith('.mdx'));
      mdxFiles.forEach(f => fs.unlinkSync(path.join(COMPONENT_DIR, f)));

      for (const comp of contract.components) {
          const storyPath = path.join(COMPONENT_DIR, `${comp.tag}.stories.ts`);
          if (fs.existsSync(storyPath)) {
              const mdxContent = generateComponentMDX(comp);
              const outputPath = path.join(COMPONENT_DIR, `${comp.tag}.mdx`);
              fs.writeFileSync(outputPath, mdxContent);
              console.log(`Generated documentation for ${comp.name}: ${outputPath}`);
          }
      }
  }
}

run();
