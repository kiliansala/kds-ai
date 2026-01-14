import fs from 'fs';
import path from 'path';

const TOKEN_FILES = {
  Primitives: 'figma/tokens.primitive.json',
  Semantic: 'figma/tokens.semantic.json',
  Components: 'figma/tokens.components.json'
};

const TOKEN_ORDER = ['Primitives', 'Semantic', 'Components'];
const OUTPUT_DIR = 'src/tokens';
const OUTPUT_FILE = 'tokens-data.json';

const playgroundData = {
  allVariables: {},
  canonicalByKey: {},
  aliasToCanonical: {},
  aliasChains: {},
  order: TOKEN_ORDER
};

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

  const normalizedName = variable.name.toLowerCase().replace(/[\/\s]/g, '-');
  const collectionName = collection.name.toLowerCase();
  const fileName = path.basename(sourceFile || '');

  const isComponentSource = fileName === 'tokens.components.json';
  const isComponentColl = collectionName === 'components';
  const isStateColl = collectionName === 'states';

  if (isComponentSource && (isComponentColl || isStateColl)) {
    return `--kds-comp-${normalizedName}`;
  }
  if (collectionName === 'key' || collectionName === 'colors') {
    return `--kds-sys-color-${normalizedName}`;
  }
  if (collectionName === 'typography' || collectionName === 'typescale') {
    return `--kds-typography-${normalizedName}`;
  }
  if (collectionName === 'space') {
    return `--kds-sys-space-${normalizedName}`;
  }
  if (collectionName === 'components') {
    return `--kds-comp-${normalizedName}`;
  }
  if (collectionName === 'states') {
    return `--kds-state-${normalizedName}`;
  }

  let cssName = `--kds-${collectionName}-${normalizedName}`;

  if (!isComponentSource) {
    if (normalizedName === 'primary') cssName = '--kds-sys-color-primary';
    if (normalizedName === 'on-primary') cssName = '--kds-sys-color-on-primary';
    if (normalizedName === 'secondary-container') cssName = '--kds-sys-color-secondary-container';
    if (normalizedName === 'on-surface-variant') cssName = '--kds-sys-color-on-surface-variant';

    if (normalizedName.includes('hover') && normalizedName.includes('opacity')) {
      cssName = '--kds-state-layer-opacity-hover';
    } else if (normalizedName.includes('focus') && normalizedName.includes('opacity')) {
      cssName = '--kds-state-layer-opacity-focus';
    } else if (normalizedName.includes('press') && normalizedName.includes('opacity')) {
      cssName = '--kds-state-layer-opacity-press';
    } else if (normalizedName.endsWith('opacity-08')) {
      cssName = '--kds-state-layer-opacity-hover';
    } else if (normalizedName.endsWith('opacity-12')) {
      cssName = '--kds-state-layer-opacity-focus';
    } else if (normalizedName.endsWith('opacity-16')) {
      cssName = '--kds-state-layer-opacity-press';
    }
  }

  return cssName;
}

function resolveAliasCssName(variable, allVars, visited = new Set()) {
  const sid = variable.shortId;
  if (!sid || visited.has(sid)) return variable.cssName;
  visited.add(sid);

  const modeId =
    variable.defaultModeId ||
    (variable.valuesByMode ? Object.keys(variable.valuesByMode)[0] : undefined);
  const valObj =
    (variable.valuesByMode && modeId && variable.valuesByMode[modeId]) ||
    (variable.valuesByMode ? Object.values(variable.valuesByMode)[0] : undefined);

  if (valObj && typeof valObj === 'object' && valObj.type === 'VARIABLE_ALIAS') {
    const targetSid = getShortId(valObj.id);
    const targetVar = allVars[targetSid];
    if (targetVar) {
      return resolveAliasCssName(targetVar, allVars, visited);
    }
  }

  return variable.cssName;
}

function buildAliasChain(variable, allVars, canonicalByKey, aliasToCanonical) {
  const chain = [];
  const visited = new Set();
  let current = variable;
  let modeId = variable.defaultModeId;

  while (current && !visited.has(current.shortId)) {
    visited.add(current.shortId);
    const parts = (current.name || '').split('/');
    chain.push({
      css: current.cssName,
      level: current.level,
      name: parts.pop() || '',
      path: parts.join('/')
    });

    const valObj = (current.valuesByMode && modeId && current.valuesByMode[modeId]) ||
      (current.valuesByMode ? Object.values(current.valuesByMode)[0] : undefined);

    if (valObj && typeof valObj === 'object' && valObj.type === 'VARIABLE_ALIAS') {
      const targetSid = getShortId(valObj.id);
      const targetVar = allVars[targetSid];
      if (targetVar) {
        // If the target is same level (duplicate), try jumping to canonical to avoid stopping at duplicates
        if (targetVar.level === current.level) {
          const canonicalCss = aliasToCanonical[targetVar.cssName] || targetVar.cssName;
          const canonical = canonicalByKey[canonicalCss];
          if (canonical) {
            const fallbackVar = allVars[canonical.id];
            if (fallbackVar) {
              current = fallbackVar;
              modeId = fallbackVar.defaultModeId || modeId;
              continue;
            }
          }
        }
        current = targetVar;
        modeId = targetVar.defaultModeId || modeId;
        continue;
      }
      const canonicalCss = aliasToCanonical[current.cssName] || current.cssName;
      const canonical = canonicalByKey[canonicalCss];
      if (canonical) {
        const fallbackVar = allVars[canonical.id];
        if (fallbackVar) {
          current = fallbackVar;
          modeId = fallbackVar.defaultModeId || modeId;
          continue;
        }
      }
    }
    break;
  }

  return chain;
}

function ingestFile(level, relativePath) {
  const filePath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(filePath)) return;

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const collections = data.meta?.variableCollections || {};
  const variables = data.meta?.variables || {};

  for (const [id, variable] of Object.entries(variables)) {
    const sid = getShortId(id);
    const collection = collections[variable.variableCollectionId];
    const cssName = getCssVarName(variable, collection, relativePath);
    const defaultModeId = collection?.defaultModeId || collection?.modes?.[0]?.modeId;

    variable.cssName = cssName;
    variable.sourceFile = path.basename(relativePath);
    variable.level = level;
    variable.shortId = sid;
    if (defaultModeId) variable.defaultModeId = defaultModeId;

    if (!playgroundData.allVariables[sid]) {
      playgroundData.allVariables[sid] = variable;
    }
  }

  playgroundData[level] = {
    collections,
    variables
  };
}

function buildCanonicalMaps() {
  TOKEN_ORDER.forEach((level) => {
    const levelData = playgroundData[level];
    if (!levelData) return;

    for (const [id, variable] of Object.entries(levelData.variables)) {
      const cssName = variable.cssName;
      const sid = getShortId(id);
      if (!playgroundData.canonicalByKey[cssName]) {
        playgroundData.canonicalByKey[cssName] = { id: sid, level };
      }
    }
  });

  Object.values(playgroundData.allVariables).forEach((variable) => {
    const sourceCss = variable.cssName;
    const targetCss = resolveAliasCssName(variable, playgroundData.allVariables);
    if (targetCss && targetCss !== sourceCss) {
      playgroundData.aliasToCanonical[sourceCss] = targetCss;
    }
  });

  // Build alias chains preserving intermediate steps
  Object.values(playgroundData.allVariables).forEach((variable) => {
    const chain = buildAliasChain(variable, playgroundData.allVariables, playgroundData.canonicalByKey, playgroundData.aliasToCanonical);
    if (chain && chain.length) {
      // store by source cssName if not already stored
      if (!playgroundData.aliasChains[variable.cssName]) {
        playgroundData.aliasChains[variable.cssName] = chain;
      }
    }
  });
}

function writeOutput() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  const outputPath = path.join(OUTPUT_DIR, OUTPUT_FILE);
  fs.writeFileSync(outputPath, JSON.stringify(playgroundData, null, 2));
  console.log(`✅ Generated ${outputPath}`);
}

function run() {
  TOKEN_ORDER.forEach((level) => {
    const filePath = TOKEN_FILES[level];
    ingestFile(level, filePath);
  });

  buildCanonicalMaps();
  writeOutput();
}

run();
