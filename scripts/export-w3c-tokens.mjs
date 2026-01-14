import fs from 'fs';
import path from 'path';

const INPUTS = [
  { name: 'primitive', file: 'figma/tokens.primitive.json' },
  { name: 'semantic', file: 'figma/tokens.semantic.json' },
  { name: 'components', file: 'figma/tokens.components.json' }
];

const OUTPUT_DIR = 'dist';

const typeMap = {
  COLOR: 'color'
  // default will be 'number'
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function toPathName(name) {
  if (!name) return '';
  // replace "/" with ".", spaces with "_"
  return name
    .split('/')
    .map((part) => part.trim().replace(/\s+/g, '_'))
    .join('.');
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
  INPUTS.forEach(({ file }) => {
    if (!fs.existsSync(file)) return;
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const collections = data.meta?.variableCollections || {};
    const variables = data.meta?.variables || {};
    for (const [id, variable] of Object.entries(variables)) {
      const pname = toPathName(variable.name);
      idToPath[id] = pname;
      // also store shortId mapping in case aliases reference short id
      const shortId = id.split(':').slice(-2).join(':');
      idToPath[shortId] = pname;
    }
  });
  return idToPath;
}

function buildW3C(filePath, idToPath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const collections = data.meta?.variableCollections || {};
  const variables = data.meta?.variables || {};

  const out = {};

  for (const variable of Object.values(variables)) {
    const tokenName = toPathName(variable.name);
    const modeId = pickMode(variable, collections);
    const valObj =
      (variable.valuesByMode && variable.valuesByMode[modeId]) ||
      Object.values(variable.valuesByMode || {})[0];

    let value = null;
    if (valObj && typeof valObj === 'object' && valObj.type === 'VARIABLE_ALIAS') {
      const targetId = valObj.id;
      const targetPath = idToPath[targetId];
      value = targetPath ? `{${targetPath}}` : null;
    } else if (valObj && typeof valObj === 'object' && 'r' in valObj && 'g' in valObj && 'b' in valObj) {
      value = rgbaToCss(valObj);
    } else {
      value = valObj;
    }

    const resolvedType = variable.resolvedType || 'number';
    const w3cType = typeMap[resolvedType] || 'number';

    const token = { $type: w3cType, $value: value };
    if (variable.description) token.$description = variable.description;

    out[tokenName] = token;
  }

  return out;
}

function main() {
  ensureDir(OUTPUT_DIR);
  const idToPath = loadAllTokens();

  INPUTS.forEach(({ name, file }) => {
    if (!fs.existsSync(file)) {
      console.warn(`Skipping missing file: ${file}`);
      return;
    }
    const w3c = buildW3C(file, idToPath);
    const outPath = path.join(OUTPUT_DIR, `tokens.${name}.w3c.json`);
    fs.writeFileSync(outPath, JSON.stringify(w3c, null, 2));
    console.log(`✅ W3C tokens written to ${outPath}`);
  });
}

main();
