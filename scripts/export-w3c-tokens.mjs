import fs from 'fs';
import path from 'path';

const INPUTS = [
  { name: 'primitive', file: 'figma/variables.primitive.json' },
  { name: 'semantic', file: 'figma/variables.semantic.json' },
  { name: 'components', file: 'figma/variables.components.json' }
];

const OUTPUT_DIR = 'dist';
const OUTPUT_FULL = path.join(OUTPUT_DIR, 'tokens');
const OUTPUT_COLL = path.join(OUTPUT_DIR, 'tokens', 'collections');

const typeMap = {
  COLOR: 'color'
  // default will be 'number'
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function normalizeSegment(value) {
  if (!value) return '';
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[._]/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildTokenPath(layer, collectionName, tokenName, modeName, includeMode) {
  const parts = [];
  if (layer) parts.push(normalizeSegment(layer));
  if (collectionName) parts.push(normalizeSegment(collectionName));
  if (tokenName) {
    tokenName
      .split('/')
      .map((seg) => normalizeSegment(seg))
      .filter(Boolean)
      .forEach((seg) => parts.push(seg));
  }
  if (includeMode && modeName) {
    parts.push(normalizeSegment(modeName));
  }
  return parts.join('.');
}

function getLayerFromPath(pathStr) {
  if (!pathStr) return '';
  const first = pathStr.split('.')[0];
  return first || '';
}

function setNested(target, pathStr, value) {
  const parts = pathStr.split('.');
  let node = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!node[p]) node[p] = {};
    node = node[p];
  }
  node[parts[parts.length - 1]] = value;
}

function makeKey(collectionName, tokenName, modeName) {
  const coll = (collectionName || '').trim().toLowerCase();
  const name = (tokenName || '').trim().toLowerCase();
  const mode = (modeName || '').trim().toLowerCase();
  return `${coll}|${name}|${mode}`;
}

function rgbaToCss(c) {
  const r = Math.round(c.r * 255);
  const g = Math.round(c.g * 255);
  const b = Math.round(c.b * 255);
  const a = c.a;
  if (a === undefined || a === 1 || a === 1.0) {
    return `#${r.toString(16).padStart(2, '0')}${g
      .toString(16)
      .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
  }
  return `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(2))})`;
}

function pickMode(variable, collections) {
  const coll = collections[variable.variableCollectionId];
  const defMode = coll?.defaultModeId;
  if (defMode && variable.valuesByMode[defMode]) return defMode;
  const first = Object.keys(variable.valuesByMode || {})[0];
  return first;
}

// Load all tokens to build an id -> path map (for aliases)
function loadAllTokens() {
  const idToPath = {};
  const canonicalByName = {}; // global: first definition by name/mode across all layers
  INPUTS.forEach(({ name, file }) => {
    if (!fs.existsSync(file)) return;
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const collections = data.meta?.variableCollections || {};
    const variables = data.meta?.variables || {};
    for (const [id, variable] of Object.entries(variables)) {
      const collName = collections[variable.variableCollectionId]?.name || '';
      const modes = collections[variable.variableCollectionId]?.modes || [];
      const includeMode = modes.length > 1;
      const modeIds = Object.keys(variable.valuesByMode || {});
      if (modeIds.length) {
        modeIds.forEach((modeId) => {
          const modeName = modes.find((m) => m.modeId === modeId)?.name || modeId;
          const pname = buildTokenPath(name, collName, variable.name, modeName, includeMode);
          idToPath[`${id}|${modeId}`] = pname;
          const shortId = id.split(':').slice(-2).join(':');
          idToPath[`${shortId}|${modeId}`] = pname;
        });
      }
      const pname = buildTokenPath(name, collName, variable.name, '', includeMode);
      idToPath[id] = pname;
      const shortId = id.split(':').slice(-2).join(':');
      idToPath[shortId] = pname;

      // canonical by name (priority by INPUT order: primitive > semantic > components)
      const canonKeyBase = makeKey('', variable.name, includeMode ? '' : '');
      if (!canonicalByName[canonKeyBase]) {
        canonicalByName[canonKeyBase] = pname.replace(/\.\.$/, '.'); // ensure no trailing dot
      }
      if (includeMode) {
        modeIds.forEach((modeId) => {
          const modeName = modes.find((m) => m.modeId === modeId)?.name || modeId;
          const canonKey = makeKey('', variable.name, modeName);
          if (!canonicalByName[canonKey]) {
            canonicalByName[canonKey] = buildTokenPath(name, collName, variable.name, modeName, includeMode);
          }
        });
      }
    }
  });
  return { idToPath, canonicalByName };
}

function buildW3C(filePath, idToPath, canonicalByNameGlobal, definedSet, layerName, canonicalByKey) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const collections = data.meta?.variableCollections || {};
  const variables = data.meta?.variables || {};

  // Map collectionId -> collectionName
  const collNames = {};
  for (const [cid, coll] of Object.entries(collections)) {
    collNames[cid] = (coll.name || '').trim();
  }

  // one output object per collection name
  const outByColl = {};
  const outFull = {};
  const summaryByColl = {}; // track per collection: direct values and alias target layers

  const varById = Object.fromEntries(Object.entries(variables));

  for (const variable of Object.values(variables)) {
    const collNameRaw = collNames[variable.variableCollectionId];
    if (!collNameRaw) continue;
    const modes = collections[variable.variableCollectionId]?.modes || [];
    const includeMode = modes.length > 1;
    const modeIds = includeMode ? Object.keys(variable.valuesByMode || {}) : [pickMode(variable, collections)];

    for (const modeId of modeIds) {
      const modeName = modes.find((m) => m.modeId === modeId)?.name || modeId;
      const tokenName = buildTokenPath(layerName, collNameRaw, variable.name, modeName, includeMode);
      const valObj =
        (variable.valuesByMode && variable.valuesByMode[modeId]) ||
        Object.values(variable.valuesByMode || {})[0];

      // registrar canónico (primera vez que aparece)
      const canonicalKey = makeKey(collNameRaw, variable.name, includeMode ? modeName : '');
      const canonicalNameKey = makeKey('', variable.name, includeMode ? modeName : '');
      const canonicalNameKeyNoMode = makeKey('', variable.name, '');
      const existingCanonical = canonicalByKey[canonicalKey];
      const existingCanonicalByName =
        canonicalByNameGlobal[canonicalNameKey] ||
        canonicalByNameGlobal[canonicalNameKeyNoMode];
      if (!existingCanonical) {
        canonicalByKey[canonicalKey] = tokenName;
      }

      let isAlias = false;
      let value = null;
      if (valObj && typeof valObj === 'object' && valObj.type === 'VARIABLE_ALIAS') {
        const targetId = valObj.id;
        const targetVar = varById[targetId] || {};
        const targetCollId = targetVar.variableCollectionId;
        const targetCollName = collNames[targetCollId] || '';
        const targetKey = makeKey(targetCollName, targetVar.name, includeMode ? modeName : '');
        const targetNameKey = makeKey('', targetVar.name, includeMode ? modeName : '');
        const targetNameKeyNoMode = makeKey('', targetVar.name, '');
        const canonicalPath =
          canonicalByKey[targetKey] ||
          canonicalByNameGlobal[targetNameKey] ||
          canonicalByNameGlobal[targetNameKeyNoMode];
        const targetPath = canonicalPath || idToPath[`${targetId}|${modeId}`] || idToPath[targetId];
        value = targetPath ? `{${targetPath}}` : null;
        isAlias = true;
      } else if (valObj && typeof valObj === 'object' && 'r' in valObj && 'g' in valObj && 'b' in valObj) {
        value = rgbaToCss(valObj);
      } else {
        value = valObj;
      }

      const resolvedType = variable.resolvedType || 'number';
      const w3cType = typeMap[resolvedType] || 'number';

      // Si ya hay un canónico de nivel superior, forzamos alias hacia él
      const canonicalUp = existingCanonical || existingCanonicalByName;
      if (!isAlias && canonicalUp && canonicalUp !== tokenName) {
        value = `{${canonicalUp}}`;
        isAlias = true;
      }

      // dedupe: solo permitir valores directos si no se definieron antes
      if (!isAlias && definedSet.has(tokenName)) {
        continue;
      }

      const token = { $type: w3cType, $value: value };
      if (variable.description) token.$description = variable.description;

      // assign to its collection bucket
      const collName = collNameRaw.toLowerCase().replace(/\s+/g, '');
      if (!outByColl[collName]) outByColl[collName] = {};
      setNested(outByColl[collName], tokenName, token);

      // assign also to full output
      setNested(outFull, tokenName, token);

      // summary info for pruning duplicated collections
      if (!summaryByColl[collName]) {
        summaryByColl[collName] = { hasDirect: false, aliasTargets: new Set() };
      }
      if (!isAlias) {
        summaryByColl[collName].hasDirect = true;
      } else {
        const targetLayer = canonicalUp ? getLayerFromPath(canonicalUp) : getLayerFromPath((value || '').replace(/[{}]/g, ''));
        if (targetLayer) summaryByColl[collName].aliasTargets.add(targetLayer);
      }

      // mark as defined if it's a direct value
      if (!isAlias) {
        definedSet.add(tokenName);
      }
    }
  }

  // prune collections that are only aliases to upper layers (except allowlisted)
  const allowlist = new Set([
    // Keep typography collections even if alias-only, per request
    'typography'
  ]);
  const layerOrder = ['primitive', 'semantic', 'components'];
  const currentIdx = layerOrder.indexOf(layerName);
  if (currentIdx > -1) {
    const higherLayers = new Set(layerOrder.slice(0, currentIdx));
    for (const [collName, summary] of Object.entries(summaryByColl)) {
      if (allowlist.has(collName)) continue;
      const onlyAliasToHigher =
        !summary.hasDirect &&
        summary.aliasTargets.size > 0 &&
        Array.from(summary.aliasTargets).every((l) => higherLayers.has(l));
      if (onlyAliasToHigher) {
        delete outByColl[collName];
        const normColl = normalizeSegment(collName);
        if (outFull[layerName] && outFull[layerName][normColl]) {
          delete outFull[layerName][normColl];
          if (Object.keys(outFull[layerName]).length === 0) {
            delete outFull[layerName];
          }
        }
      }
    }
  }

  return { outByColl, outFull };
}

function main() {
  ensureDir(OUTPUT_DIR);
  ensureDir(OUTPUT_FULL);
  ensureDir(OUTPUT_COLL);
  const { idToPath, canonicalByName } = loadAllTokens();
  const definedSet = new Set(); // track definitions across levels
  const canonicalByKey = {}; // track first definition per collection/name/mode

  INPUTS.forEach(({ name, file }) => {
    if (!fs.existsSync(file)) {
      console.warn(`Skipping missing file: ${file}`);
      return;
    }
    const { outByColl, outFull } = buildW3C(file, idToPath, canonicalByName, definedSet, name, canonicalByKey);

    // write full file
    const fullPath = path.join(OUTPUT_FULL, `tokens.${name}.w3c.json`);
    fs.writeFileSync(fullPath, JSON.stringify(outFull, null, 2));
    console.log(`✅ W3C tokens written to ${fullPath}`);

    // write collections
    for (const [collName, obj] of Object.entries(outByColl)) {
      const outPath = path.join(OUTPUT_COLL, `tokens.${name}.${collName}.w3c.json`);
      fs.writeFileSync(outPath, JSON.stringify(obj, null, 2));
      console.log(`✅ W3C tokens written to ${outPath}`);
    }
  });
}

main();
