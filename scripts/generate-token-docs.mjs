import fs from 'fs';
import path from 'path';

const TOKEN_FILES = {
  Primitives: 'figma/variables.primitive.json',
  Semantic: 'figma/variables.semantic.json',
  Components: 'figma/variables.components.json'
};

const TOKEN_ORDER = ['Primitives', 'Semantic', 'Components'];
const OUTPUT_DIR = 'src/tokens';
const OUTPUT_FILE = 'tokens-data.json';

const playgroundData = {
  allVariables: {},
  canonicalByKey: {},
  aliasToCanonical: {},
  cssToFullId: {},
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

function normalizeTokenPath(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/\//g, '.')
    .replace(/[^a-z0-9.\-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/\.-/g, '.')
    .replace(/-\./g, '.');
}

function getCssVarName(variable, collection, sourceFile, level) {
  if (!variable || !collection || !level) return '--kds-unknown';
  const normalizedPath = normalizeTokenPath(variable.name);
  const normalizedCollection = normalizeTokenPath(collection.name);
  const prefixMap = {
    Primitives: '--kds-pri.',
    Semantic: '--kds-sem.',
    Components: '--kds-comp.'
  };
  const prefix = prefixMap[level] || '--kds-unknown.';
  const path = normalizedCollection
    ? `${normalizedCollection}.${normalizedPath}`
    : normalizedPath;
  return `${prefix}${path}`;
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
        // If the target is same level (duplicate), prefer its canonical entry (keeps Semantic hop) before jumping straight to a deduped alias
        if (targetVar.level === current.level) {
          const canonical = canonicalByKey[targetVar.cssName];
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
    const cssName = getCssVarName(variable, collection, relativePath, level);
    const defaultModeId = collection?.defaultModeId || collection?.modes?.[0]?.modeId;

    variable.cssName = cssName;
    variable.sourceFile = path.basename(relativePath);
    variable.level = level;
    variable.shortId = sid;
    if (defaultModeId) variable.defaultModeId = defaultModeId;

    // Keep track of first occurrence (highest priority) full id per cssName
    if (!playgroundData.cssToFullId[cssName]) {
      playgroundData.cssToFullId[cssName] = id;
    } else {
      // If this is a lower-priority level and css already defined, make it an alias to the canonical
      const targetFullId = playgroundData.cssToFullId[cssName];
      const modeKey = variable.defaultModeId || (variable.valuesByMode ? Object.keys(variable.valuesByMode)[0] : undefined);
      if (modeKey) {
        variable.valuesByMode = {
          [modeKey]: {
            type: 'VARIABLE_ALIAS',
            id: targetFullId
          }
        };
      }
    }

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
