import './style.css'
import './styles/tokens.css'
import './components/kds-button'
import contractData from '../contracts/component-definitions.json'
import { t, getCurrentLang, setLang, onLangChange } from './i18n/index'
// @ts-ignore
import tokensData from './tokens/tokens-data.json'

interface Contract {
  version: string;
  components: any[];
}

const data = contractData as Contract;
const app = document.querySelector<HTMLDivElement>('#app')!;

const COLLECTION_PRIORITY = ['Colors', 'Key', 'Components', 'States', 'Space', 'Typography', 'Typescale', 'Typeface'];

// --- Token helpers with canonical/alias support ---
const allVariables: Record<string, any> = (tokensData as any).allVariables || {};
const canonicalByKey: Record<string, { id: string; level: string }> = (tokensData as any).canonicalByKey || {};
const aliasToCanonical: Record<string, string> = (tokensData as any).aliasToCanonical || {};
const LEVEL_ORDER: string[] = (tokensData as any).order || ['Primitives', 'Semantic', 'Components'];

const normalizeCss = (css: string) => (css || '').startsWith('--') ? css : `--${css}`;

const getCanonicalVarByCss = (cssName: string) => {
    const normalized = normalizeCss(cssName);
    const canonicalCss = aliasToCanonical[normalized] || normalized;
    const canonical = canonicalByKey[canonicalCss];
    if (!canonical) return null;
    const variable = allVariables[canonical.id];
    if (!variable) return null;
    const levelData = (tokensData as any)[canonical.level];
    const coll = levelData?.collections?.[variable.variableCollectionId];
    if (!coll) return null;
    return { variable, coll, css: canonicalCss, level: canonical.level };
};

const resolveCanonicalSid = (cssName: string) => {
    const normalized = normalizeCss(cssName);
    const canonicalCss = aliasToCanonical[normalized] || normalized;
    const canonical = canonicalByKey[canonicalCss];
    return canonical ? { sid: canonical.id, level: canonical.level, css: canonicalCss } : null;
};

const getVariableLevel = (v: any) => v?.level || resolveCanonicalSid(v?.cssName || '')?.level || 'Primitives';

const resolveValueRecursive = (variable: any, modeId: string, visited = new Set<string>()): any => {
    if (!variable || !variable.valuesByMode) return '—';
    const sid = variable.shortId;
    if (sid && visited.has(sid)) return 'Alias';
    if (sid) visited.add(sid);
    const valObj = variable.valuesByMode[modeId] || Object.values(variable.valuesByMode)[0];

    if (valObj && typeof valObj === 'object' && valObj.type === 'VARIABLE_ALIAS') {
        const targetSid = getShortId(valObj.id);
        const targetVar = allVariables[targetSid];
        if (targetVar) return resolveValueRecursive(targetVar, targetVar.defaultModeId || modeId, visited);
        return 'Alias';
    }
    if (valObj && typeof valObj === 'object' && 'r' in valObj) {
        const r = Math.round(valObj.r * 255);
        const g = Math.round(valObj.g * 255);
        const b = Math.round(valObj.b * 255);
        if (valObj.a === 1) return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
        return `rgba(${r}, ${g}, ${b}, ${valObj.a.toFixed(2)})`;
    }
    if (variable.name.toLowerCase().includes('weight') && typeof valObj === 'string') {
        const weights: any = { thin: 100, light: 300, regular: 400, medium: 500, semibold: 600, bold: 700, black: 900 };
        return weights[valObj.toLowerCase()] || valObj;
    }
    if (typeof valObj === 'number') return valObj === 0 ? '0' : `${valObj}px`;
    return valObj !== undefined ? valObj : '—';
};

const resolveAliasChainForMode = (variable: any, modeId: string) => {
    // Build chain per mode (precomputed chains ignore mode-specific aliases)
    const chain: { variable: any; level: string }[] = [];
    const visited = new Set<string>();
    let current: any = variable;
    let currentMode = modeId;

    while (current && !visited.has(current.shortId)) {
        visited.add(current.shortId);
        chain.push({ variable: current, level: getVariableLevel(current) });
        const valObj = current.valuesByMode[currentMode] || Object.values(current.valuesByMode)[0];
        if (valObj && typeof valObj === 'object' && valObj.type === 'VARIABLE_ALIAS') {
            const targetSid = getShortId(valObj.id);
            const targetVar = allVariables[targetSid];
            if (targetVar) {
                current = targetVar;
                currentMode = targetVar.defaultModeId || currentMode;
                continue;
            }
            // fallback: use canonical mapping if alias target not found
            const canonicalCss = aliasToCanonical[current.cssName] || current.cssName;
            const canonical = canonicalByKey[canonicalCss];
            if (canonical) {
                const fallbackVar = allVariables[canonical.id];
                if (fallbackVar) {
                    current = fallbackVar;
                    currentMode = fallbackVar.defaultModeId || currentMode;
                    continue;
                }
            }
        }
        break;
    }

    const resolvedValue = resolveValueRecursive(variable, modeId);
    // If last hop is not the canonical (by level), append the canonical hop even if cssName matches
    const last = chain[chain.length - 1];
    const canonicalCss = aliasToCanonical[last?.variable?.cssName || ''] || last?.variable?.cssName;
    const canonical = canonicalCss ? canonicalByKey[canonicalCss] : null;
    if (canonical && last && canonical.level !== last.level) {
        const fallbackVar = allVariables[canonical.id];
        if (fallbackVar) {
            chain.push({ variable: fallbackVar, level: canonical.level });
        }
    }

    const target = chain[chain.length - 1]?.variable;
    const targetLevel = chain[chain.length - 1]?.level || getVariableLevel(variable);

    const seen = new Set<string>();
    const visibleChain = chain.filter((entry) => {
        const cssKey = entry.variable.cssName || '';
        if (cssKey && seen.has(cssKey)) return false;
        if (cssKey) {
            seen.add(cssKey);
            return true;
        }
        const key = `${entry.variable.name}|${entry.level}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
    const chainHtml = visibleChain.length ? visibleChain.map((entry, idx) => {
        const parts = (entry.variable.name || '').split('/');
        const name = parts.pop() || '';
        const path = parts.join('/');
        return `→ ${name} ${path ? `(${path})` : ''}<br><small style="color:#999;">${(entry.level || '').toLowerCase()}</small>${idx === visibleChain.length - 1 ? '' : '<br>'}`;
    }).join('<br>') : '—';

    const cssChain = visibleChain
        .map((entry) => normalizeCss(entry.variable.cssName || ''))
        .filter(Boolean);

    const tokenChain = visibleChain.map((entry) => {
        const css = normalizeCss(entry.variable.cssName || '');
        const canonical = css ? canonicalByKey[css] : null;
        const level = canonical?.level || entry.level;
        const varId = canonical?.id || entry.variable.shortId;
        const realVar = allVariables[varId] || entry.variable;
        const levelDataAll = (tokensData as any)[level];
        const collName = levelDataAll?.collections?.[realVar?.variableCollectionId]?.name || '';
        const tokenPath = realVar?.name || '';
        return [level, collName, tokenPath].filter(Boolean).join('/');
    }).filter(Boolean);

    return { chainHtml, resolvedValue, targetLevel, targetVar: target, cssChain, tokenChain };
};

const toKebabCase = (str: string) => str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

const getShortId = (id: string) => {
    if (!id) return id;
    const parts = id.split(':');
    if (parts.length > 1) {
        const lastNum = parts.pop();
        const midNum = parts.pop()!.split('/').pop();
        return `${midNum}:${lastNum}`;
    }
    return id;
};

const getCssVarName = (variable: any) => normalizeCss(variable?.cssName || '');

const renderNav = (selected: string) => {
  const lang = getCurrentLang();
  return `
    <nav>
      <h3>KDS AI v${data.version}</h3>
      
      <div class="nav-section">
        <h4 style="margin: 1rem 0 0.5rem; color: #999; font-size: 0.75em; text-transform: uppercase;">${t('nav.designTokens')}</h4>
        <ul>
          <li><a href="#tokensOverview" style="text-decoration:none;" class="nav-link ${selected === 'tokensOverview' ? 'active' : ''}">${t('nav.overview')}</a></li>
          <li><a href="#tokensW3C/Primitives" style="text-decoration:none;" class="nav-link ${selected === 'tokensW3C/Primitives' ? 'active' : ''}">${t('nav.primitives')}</a></li>
          <li><a href="#tokensW3C/Semantic" style="text-decoration:none;" class="nav-link ${selected === 'tokensW3C/Semantic' ? 'active' : ''}">${t('nav.semantic')}</a></li>
          <li><a href="#tokensW3C/Components" style="text-decoration:none;" class="nav-link ${selected === 'tokensW3C/Components' ? 'active' : ''}">${t('nav.components')}</a></li>
        </ul>
      </div>

      <div class="nav-section">
        <h4 style="margin: 1.5rem 0 0.5rem; color: #999; font-size: 0.75em; text-transform: uppercase;">${t('nav.componentsDocs')}</h4>
        <ul>
          ${data.components.map(c => `
            <li><a href="#${c.tag}" style="text-decoration:none;" class="nav-link ${selected === c.tag ? 'active' : ''}">${c.name}</a></li>
          `).join('')}
        </ul>
      </div>
      
      <div class="lang-selector">
        <label>${t('nav.language')}:</label>
        <button class="${lang === 'en' ? 'active' : ''}" onclick="window.switchLang('en')">EN</button>
        <button class="${lang === 'es' ? 'active' : ''}" onclick="window.switchLang('es')">ES</button>
        <button class="${lang === 'de' ? 'active' : ''}" onclick="window.switchLang('de')">DE</button>
      </div>
    </nav>
  `
};

const groupVariables = (coll: any, isTypography: boolean) => {
    const groups: Record<string, any[]> = {};
    coll.variableIds.forEach((vid: string) => {
        const variable = allVariables[getShortId(vid)];
        if (!variable) return;
        const parts = (variable.name || '').split('/');
        const groupName = isTypography ? '' : (parts.length > 1 ? parts.slice(0, -1).join('/') : '');
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push(variable);
    });
    return groups;
};

const renderTokenRow = (variable: any, coll: any) => {
    const cssCurrent = normalizeCss(variable.cssName || '');
    const isColor = variable.resolvedType === 'COLOR';
    const modeRef = coll.modes[0]?.modeId;
    const { tokenChain } = resolveAliasChainForMode(variable, modeRef);
    const aliasNames = tokenChain && tokenChain.length > 1 ? tokenChain.slice(1) : [];

    const modeCells = coll.modes.map((m: any) => {
        const { resolvedValue } = resolveAliasChainForMode(variable, m.modeId);
        const swatch = isColor ? `<div style="flex-shrink:0; width:18px; height:18px; background:${resolvedValue}; border:1px solid #ddd; border-radius:4px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);"></div>` : '';
        return `
            <td style="vertical-align: top; padding: 12px;">
                <div style="margin-top:6px; display:flex; align-items:center; gap:8px;">
                    ${swatch}<code>${resolvedValue}</code>
                </div>
            </td>
        `;
    }).join('');

    return `
        <tr>
            <td style="vertical-align: top; padding: 12px;">
                <strong>${(variable.name || '').split('/').pop()}</strong><br>
                <small style="color:#999; font-family: monospace; font-size: 0.8em;">${variable.name}</small>
            </td>
            ${modeCells}
            <td style="vertical-align: top; padding: 12px;"><code style="font-size: 0.8em; color: #d63384;">${cssCurrent}</code></td>
            <td style="vertical-align: top; padding: 12px; font-size: 0.8em; color: #666;">${aliasNames.length ? aliasNames.map((n) => `→ ${n}`).join('<br>') : ''}</td>
        </tr>
    `;
};

const renderTokensView = (level: string) => {
    const levelData = (tokensData as any)[level];
    if (!levelData) return `<main><h1>Tokens not found</h1></main>`;

    const collections = Object.values(levelData.collections)
        .filter((c: any) => !c.remote)
        .sort((a: any, b: any) => {
            let indexA = COLLECTION_PRIORITY.indexOf(a.name);
            let indexB = COLLECTION_PRIORITY.indexOf(b.name);
            if (indexA === -1) indexA = 99;
            if (indexB === -1) indexB = 99;
            return indexA - indexB;
        });

    const aside = collections.map((c: any) => {
        const isTypography = c.name.toLowerCase().includes('typography') || c.name.toLowerCase().includes('typescale');
        const groups = groupVariables(c, isTypography);
        const groupNames = Object.keys(groups).filter(g => g);
        const ungrouped = groups[''] ? `<li style="margin:0.25rem 0 0.25rem 0.5rem; color:#888; font-size:0.8em; text-decoration:none;">Ungrouped (${groups[''].length})</li>` : '';
        return `
            <li style="margin-bottom: 0.75rem;">
                <a href="javascript:void(0)" style="text-decoration:none;" onclick="document.getElementById('coll-${c.name}').scrollIntoView({behavior:'smooth'})" class="collection-link no-underline">${c.name}</a>
                <ul style="list-style:none; padding-left:0.75rem; margin-top:0.35rem;">
                    ${ungrouped}
                    ${groupNames.map(g => `<li style="margin:0.25rem 0;"><a href="javascript:void(0)" style="color:#0066cc; font-size:0.85em; text-decoration:none;" class="no-underline" onclick="document.getElementById('group-${c.name}-${g.replace(/\\s+/g,'-')}').scrollIntoView({behavior:'smooth'})">${g}</a></li>`).join('')}
                </ul>
            </li>`;
    }).join('');

    let html = `<main>
        <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 2rem;">
            <h1>${level} Tokens</h1>
            <span style="color: #999; font-size: 0.8em; font-weight: 600;">SINGLE SOURCE OF TRUTH: FIGMA</span>
        </div>
        <div style="display: grid; grid-template-columns: 240px 1fr; gap: 3rem;">
            <aside style="position: sticky; top: 2rem; height: fit-content;">
                <h5 style="margin: 0 0 1rem; color: #666; font-size: 0.8em; text-transform: uppercase;">Collections</h5>
                <ul style="list-style: none; padding: 0; margin: 0;">${aside}</ul>
            </aside>
            <section>`;

    collections.forEach((coll: any) => {
        const isTypography = coll.name.toLowerCase().includes('typography') || coll.name.toLowerCase().includes('typescale');
        const groups = groupVariables(coll, isTypography);
        const groupOrder = [''].concat(Object.keys(groups).filter(g => g));

        html += `<h2 id="coll-${coll.name}" style="background: #f8f9fa; padding: 0.75rem 1rem; border-radius: 6px; border-left: 5px solid #1484ff; margin: 0 0 1.5rem 0; font-size: 1.25em;">${coll.name}</h2>`;

        groupOrder.forEach((groupName) => {
            const vars = groups[groupName] || [];
            if (vars.length === 0) return;
            const heading = groupName ? `<h3 id="group-${coll.name}-${groupName.replace(/\\s+/g,'-')}" style="margin: 1.5rem 0 0.75rem; color:#444;">${groupName}</h3>` : '';
            html += `${heading}
                <table class="api-table" style="margin-bottom: 2rem; width: 100%;">
                    <thead>
                        <tr>
                            <th style="width: 260px; background: #fafafa;">Token Name</th>
                            ${coll.modes.map((m: any) => `<th style="background: #fafafa;">${m.name}</th>`).join('')}
                            <th style="background: #fafafa;">CSS Variable</th>
                            <th style="background: #fafafa;">Token Chain</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${vars.map(v => renderTokenRow(v, coll)).join('')}
                    </tbody>
                </table>`;
        });
    });

    html += `</section></div></main>`;
    return html;
};

const W3C_SCOPE_MAP: Record<string, string> = {
    Primitives: 'primitive',
    Semantic: 'semantic',
    Components: 'components'
};

const W3C_PREFIX_MAP: Record<string, string> = {
    Primitives: '--kds-pri.',
    Semantic: '--kds-sem.',
    Components: '--kds-comp.'
};

const W3C_COLLECTIONS: Record<string, string[]> = {
    Primitives: ['colors', 'space', 'shape', 'typeface', 'typescale'],
    Semantic: ['key', 'space', 'status', 'typescale', 'typography'],
    Components: ['components', 'key', 'states', 'typescale', 'typography']
};

const fetchW3CJson = async (scope: string) => {
    const fileName = `tokens.${scope}.w3c.json`;
    const baseUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
    const url = new URL(`tokens/${fileName}`, baseUrl);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${fileName}`);
    return res.json();
};

const fetchW3CCollectionJson = async (scope: string, collection: string) => {
    const fileName = `tokens.${scope}.${collection}.w3c.json`;
    const baseUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
    const url = new URL(`tokens/collections/${fileName}`, baseUrl);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${fileName}`);
    return res.json();
};

const flattenW3C = (node: any, prefix: string[] = [], out: any[] = []) => {
    if (!node || typeof node !== 'object') return out;
    if ('$value' in node) {
        out.push({ path: prefix.join('.'), token: node });
        return out;
    }
    Object.entries(node).forEach(([key, value]) => {
        if (key.startsWith('$')) return;
        flattenW3C(value, [...prefix, key], out);
    });
    return out;
};

const resolveW3CAliasChain = (path: string, tokenMap: Record<string, any>) => {
    const chain: string[] = [];
    const visited = new Set<string>();
    let currentPath = path;
    while (currentPath && !visited.has(currentPath)) {
        visited.add(currentPath);
        chain.push(currentPath);
        const token = tokenMap[currentPath];
        const rawValue = token?.$value;
        if (typeof rawValue === 'string') {
            const match = rawValue.match(/^\{(.+)\}$/);
            if (match) {
                currentPath = match[1];
                continue;
            }
        }
        break;
    }
    return chain;
};

const getScopeFromPath = (path: string) => {
    if (!path) return '';
    const first = path.split('.')[0];
    if (first === 'primitive') return 'Primitives';
    if (first === 'semantic') return 'Semantic';
    if (first === 'component' || first === 'components') return 'Components';
    return '';
};

const resolveFinalTokenValue = (startPath: string, tokenMap: Record<string, any>, globalMap?: Record<string, any>) => {
    let currentPath = startPath;
    const visited = new Set<string>();
    const getToken = (p: string) => tokenMap[p] || globalMap?.[p];
    while (currentPath && !visited.has(currentPath)) {
        visited.add(currentPath);
        const token = getToken(currentPath);
        if (!token) break;
        const rawValue = token.$value;
        if (typeof rawValue === 'string') {
            const match = rawValue.match(/^\{(.+)\}$/);
            if (match) {
                currentPath = match[1];
                continue;
            }
            return { value: rawValue, path: currentPath, token };
        } else {
            return { value: rawValue, path: currentPath, token };
        }
    }
    const tokenFallback = getToken(currentPath);
    return { value: undefined, path: currentPath, token: tokenFallback };
};

const sanitizeId = (path: string) => path.replace(/[^a-zA-Z0-9_-]+/g, '-');

const MODE_SUFFIXES = ['light', 'dark'];

const renderTokensW3CView = async (scopeLabel: string) => {
    const scope = W3C_SCOPE_MAP[scopeLabel];
    const prefix = W3C_PREFIX_MAP[scopeLabel] || '--kds-unknown.';
    if (!scope) return `<main><h1>Tokens not found</h1></main>`;

    let data: any;
    try {
        data = await fetchW3CJson(scope);
    } catch (error: any) {
        return `<main><h1>Tokens not found</h1><p>${error?.message || 'Failed to load W3C tokens.'}</p></main>`;
    }

    // build global map to resolve cross-scope aliases
    const tokenMapGlobal: Record<string, any> = {};
    const addToGlobal = (obj: any) => {
        const flatAll = flattenW3C(obj);
        flatAll.forEach(({ path, token }) => tokenMapGlobal[path] = token);
    };
    addToGlobal(data);
    if (scope !== 'primitive') {
        try {
            const prim = await fetchW3CJson('primitive');
            addToGlobal(prim);
        } catch (e) {
            // ignore
        }
    }
    if (scope === 'components') {
        try {
            const sem = await fetchW3CJson('semantic');
            addToGlobal(sem);
        } catch (e) {
            // ignore
        }
    }

    const flat = flattenW3C(data);
    const tokenMap: Record<string, any> = {};
    flat.forEach((item) => {
        tokenMap[item.path] = item.token;
    });

    const normalizePathParts = (path: string) => path.split('.').filter(Boolean);
    const collectionMap: Record<string, Record<string, any[]>> = {};
    const collections = W3C_COLLECTIONS[scopeLabel] || [];

    const collectionData: Record<string, any> = {};
    for (const coll of collections) {
        try {
            collectionData[coll] = await fetchW3CCollectionJson(scope, coll);
        } catch (error) {
            collectionData[coll] = null;
        }
    }

    Object.entries(collectionData).forEach(([collection, collJson]) => {
        if (!collJson) return;
        const flatColl = flattenW3C(collJson);
        flatColl.forEach(({ path, token }) => {
            const parts = normalizePathParts(path);
            const last = parts[parts.length - 1];
            const isMode = MODE_SUFFIXES.includes(last);
            const mode = isMode ? last : '';
            const baseParts = isMode ? parts.slice(0, -1) : parts;
            const basePath = baseParts.join('.');
            // group: between collection and token name
            const group = baseParts.length > 3 ? baseParts.slice(2, -1).join('/') : '';

            if (!collectionMap[collection]) collectionMap[collection] = {};
            if (!collectionMap[collection][group]) collectionMap[collection][group] = [];

            let entry = collectionMap[collection][group].find((e: any) => e.basePath === basePath);
            if (!entry) {
                entry = { basePath, modes: {}, tokenType: token.$type };
                collectionMap[collection][group].push(entry);
            }
            const modeKey = mode || 'value';
            entry.modes[modeKey] = { path, token, collection };
        });
    });

    const collectionNames = Object.keys(collectionMap).sort((a, b) => {
        if (a === 'colors') return -1;
        if (b === 'colors') return 1;
        return a.localeCompare(b);
    });
    const aside = collectionNames.map((collName) => {
        const groups = collectionMap[collName] || {};
        const groupNames = Object.keys(groups).filter((g) => (groups[g]?.length || 0) > 0);
        const totalCount = Object.values(groups).reduce((acc: number, arr: any[]) => acc + (arr?.length || 0), 0);
        const ungrouped = groups[''] && groups[''].length
            ? `<li style="margin:0.25rem 0 0.25rem 0.5rem; color:#888; font-size:0.8em; text-decoration:none;">${t('common.ungrouped')} (${groups[''].length})</li>`
            : '';
        return `
            <li style="margin-bottom: 0.75rem;">
                <a href="javascript:void(0)" style="text-decoration:none;" onclick="document.getElementById('w3c-coll-${collName}').scrollIntoView({behavior:'smooth'})" class="collection-link no-underline">${collName} <span style="color:#888; font-size:0.8em;">(${totalCount})</span></a>
                <ul style="list-style:none; padding-left:0.75rem; margin-top:0.35rem;">
                    ${ungrouped}
                    ${groupNames.filter(g => g).map(g => `<li style="margin:0.25rem 0;"><a href="javascript:void(0)" style="color:#0066cc; font-size:0.85em; text-decoration:none;" class="no-underline" onclick="document.getElementById('w3c-group-${collName}-${g.replace(/\\s+/g,'-')}').scrollIntoView({behavior:'smooth'})">${g} <span style="color:#888; font-size:0.8em;">(${groups[g].length})</span></a></li>`).join('')}
                </ul>
            </li>`;
    }).join('');

    const renderW3CRow = (entry: any, modeColumns: string[]) => {
        const modes = Object.keys(entry.modes);
        const effectiveModes = modeColumns.length ? modeColumns : ['value'];

        const cells = effectiveModes.map((m) => {
            const tokenObj = entry.modes[m] || entry.modes['value'];
            const rawValue = tokenObj?.token?.$value;
            const aliasMatch = typeof rawValue === 'string' && rawValue.match(/^\{(.+)\}$/);
            const aliasTarget = aliasMatch ? aliasMatch[1] : '';
            const resolved = aliasTarget
                ? resolveFinalTokenValue(aliasTarget, tokenMap, tokenMapGlobal)
                : resolveFinalTokenValue(tokenObj?.path, tokenMap, tokenMapGlobal);
            const displayValue = aliasTarget ? `{${aliasTarget}}` : (typeof rawValue === 'string' ? rawValue : JSON.stringify(rawValue));
            const resolvedValue = resolved.value;
            const resolvedToken = resolved.token;
            const isHexOrRgba = (val: any) => typeof val === 'string' && (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(val) || /^rgba?\(/i.test(val));
            const isColor = tokenObj?.token?.$type === 'color' || resolvedToken?.$type === 'color' || isHexOrRgba(resolvedValue);
            const hasLiteral = typeof resolvedValue === 'string' && !resolvedValue.startsWith('{');
            const swatch = isColor && hasLiteral
                ? `<div style="flex-shrink:0; width:18px; height:18px; background:${resolvedValue}; border:1px solid #ddd; border-radius:4px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);"></div>`
                : '';

            const isFont = tokenObj?.token?.$type === 'fontFamily'
                || tokenObj?.token?.$type === 'typography'
                || resolvedToken?.$type === 'fontFamily'
                || resolvedToken?.$type === 'typography'
                || entry.basePath.includes('typeface')
                || entry.basePath.includes('typography')
                || entry.basePath.includes('typescale');
            const textSample = !isColor && hasLiteral && isFont
                ? `<span style="font-family:${resolvedValue}; font-size:14px; font-weight:400; color:#222;">The quick brown fox jumps over the lazy dog</span>`
                : '';

            const targetScope = aliasTarget ? getScopeFromPath(aliasTarget) : scopeLabel;
            const linkHref = aliasTarget
                ? `#tokensW3C/${targetScope}/${sanitizeId(aliasTarget)}`
                : '';
            const linkContent = aliasTarget
                ? `<a href="${linkHref}" onclick="window.scrollToToken && window.scrollToToken('${sanitizeId(aliasTarget)}'); event.stopPropagation();">{${aliasTarget}}</a>`
                : `{${displayValue}}`;

            const copyVal = aliasTarget
                ? aliasTarget
                : (hasLiteral ? resolvedValue : displayValue);

            return `
                <td style="vertical-align: top; padding: 12px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        ${swatch}${textSample}<code>${linkContent}</code>
                        <button style="border:1px solid #ddd; background:#f7f7f7; border-radius:4px; padding:2px 6px; cursor:pointer; font-size:0.75em;" onclick="window.copyTokenValue && window.copyTokenValue('${encodeURIComponent(copyVal ?? '')}', this)">⧉</button>
                    </div>
                </td>
            `;
        }).join('');

        const tokenName = entry.basePath.split('.').pop();
        return `
            <tr id="w3c-token-${sanitizeId(entry.basePath)}">
                <td style="vertical-align: top; padding: 12px;">
                    <strong>${tokenName}</strong><br>
                    <small style="color:#999; font-family: monospace; font-size: 0.8em;">${entry.basePath}</small>
                </td>
                ${cells}
            </tr>
        `;
    };

    // Generate page introduction based on scope
    const scopeKey = scopeLabel.toLowerCase();
    let pageIntro = '';
    
    if (scopeLabel === 'Primitives') {
        pageIntro = `
            <div class="page-intro">
                <h2>${t('primitives.title')}</h2>
                <p>${t('primitives.intro')}</p>
                
                <div class="scope-definition">
                    <h3>${t('primitives.scope')}</h3>
                    <ul>
                        <li>${t('primitives.whatAre')}</li>
                        <li>${t('primitives.whoDef')}</li>
                        <li>${t('primitives.whoConsumes')}</li>
                        <li>${t('primitives.whenUse')}</li>
                    </ul>
                </div>
                
                <div class="naming-convention">
                    <h3>${t('primitives.namingConvention')}</h3>
                    <p>${t('primitives.namingIntro')}</p>
                    <code>primitive.{collection}.{group}.{token}.{mode?}</code>
                    <p>${t('primitives.namingExample')}</p>
                    <ul>
                        <li><code>colors</code> = colección</li>
                        <li><code>ramps</code> = grupo (escalas de luminosidad 0-99)</li>
                        <li><code>blue</code> = familia de color</li>
                        <li><code>50</code> = paso de la escala (50 = tono medio)</li>
                    </ul>
                </div>
                
                <div class="cross-reference">
                    <p>→ Ver <a href="#tokensW3C/Semantic">${t('nav.semantic')}</a> para tokens con intención de uso<br>
                    → Ver <a href="#tokensW3C/Components">${t('nav.components')}</a> para tokens específicos de componentes</p>
                </div>
            </div>
        `;
    } else if (scopeLabel === 'Semantic') {
        pageIntro = `
            <div class="page-intro">
                <h2>${t('semantic.title')}</h2>
                <p>${t('semantic.intro')}</p>
                
                <div class="scope-definition">
                    <h3>${t('semantic.scope')}</h3>
                    <ul>
                        <li>${t('semantic.whatAre')}</li>
                        <li>${t('semantic.whoDef')}</li>
                        <li>${t('semantic.whoConsumes')}</li>
                        <li>${t('semantic.whenUse')}</li>
                    </ul>
                </div>
                
                <div class="naming-convention">
                    <h3>${t('semantic.themingTitle')}</h3>
                    <p>${t('semantic.themingIntro')}</p>
                    <p><strong>${t('common.light')}:</strong> <code>semantic.key.black.light</code> → <code>{primitive.colors.base.black}</code><br>
                    <strong>${t('common.dark')}:</strong> <code>semantic.key.black.dark</code> → <code>{primitive.colors.base.white}</code></p>
                    <p>${t('semantic.themingExample')}</p>
                </div>
                
                <div class="scope-definition">
                    <h3>${t('semantic.aliasTitle')}</h3>
                    <p>${t('semantic.aliasIntro')}</p>
                    <ul>
                        <li>${t('semantic.aliasItem1')}</li>
                        <li>${t('semantic.aliasItem2')}</li>
                        <li>${t('semantic.aliasItem3')}</li>
                    </ul>
                </div>
            </div>
        `;
    } else if (scopeLabel === 'Components') {
        pageIntro = `
            <div class="page-intro">
                <h2>${t('components.title')}</h2>
                <p>${t('components.intro')}</p>
                
                <div class="scope-definition">
                    <h3>${t('components.scope')}</h3>
                    <ul>
                        <li>${t('components.whatAre')}</li>
                        <li>${t('components.whoDef')}</li>
                        <li>${t('components.whoConsumes')}</li>
                        <li>${t('components.whenUse')}</li>
                    </ul>
                </div>
                
                <div class="naming-convention">
                    <h3>${t('components.whenCreateTitle')}</h3>
                    <p>${t('components.whenCreateIntro')}</p>
                    <ul>
                        <li>${t('components.whenCreateItem1')}</li>
                        <li>${t('components.whenCreateItem2')}</li>
                        <li>${t('components.whenCreateItem3')}</li>
                    </ul>
                    <p>${t('components.whenCreateExample')}</p>
                </div>
                
                <div class="scope-definition">
                    <h3>${t('components.hierarchyTitle')}</h3>
                    <p>${t('components.hierarchyIntro')}</p>
                    <ul>
                        <li>${t('components.hierarchySemantic')}</li>
                        <li>${t('components.hierarchyPrimitive')}</li>
                    </ul>
                    <p>${t('components.hierarchyWarning')}</p>
                </div>
            </div>
        `;
    }
    
    // Helper to get collection description
    const getCollectionDesc = (collName: string, scopeLabel: string) => {
        if (scopeLabel === 'Primitives' && collName === 'colors') {
            return `
                <h2 id="w3c-coll-${collName}" style="background: #f8f9fa; padding: 0.75rem 1rem; border-radius: 6px; border-left: 5px solid #1484ff; margin: 0 0 1.5rem 0; font-size: 1.25em;">Colors</h2>
                <div class="collection-description">
                    <p>${t('primitives.colorsBase')}</p>
                    <p>${t('primitives.colorsRamps')}</p>
                    <p>${t('primitives.colorsModes')}</p>
                </div>
            `;
        } else if (scopeLabel === 'Primitives' && collName === 'space') {
            return `
                <h2 id="w3c-coll-${collName}" style="background: #f8f9fa; padding: 0.75rem 1rem; border-radius: 6px; border-left: 5px solid #1484ff; margin: 0 0 1.5rem 0; font-size: 1.25em;">Space</h2>
                <div class="collection-description">
                    <p>${t('primitives.spaceDesc')}</p>
                    <p>${t('primitives.spaceNaming')}</p>
                    <p>${t('primitives.spaceUsage')}</p>
                </div>
            `;
        } else if (scopeLabel === 'Semantic' && collName === 'key') {
            return `
                <h2 id="w3c-coll-${collName}" style="background: #f8f9fa; padding: 0.75rem 1rem; border-radius: 6px; border-left: 5px solid #1484ff; margin: 0 0 1.5rem 0; font-size: 1.25em;">Key</h2>
                <div class="collection-description">
                    <p>${t('semantic.keyDesc')}</p>
                    <p>${t('semantic.keyUsage')}</p>
                    <p>${t('semantic.keyDiff')}</p>
                </div>
            `;
        } else if (scopeLabel === 'Semantic' && collName === 'space') {
            return `
                <h2 id="w3c-coll-${collName}" style="background: #f8f9fa; padding: 0.75rem 1rem; border-radius: 6px; border-left: 5px solid #1484ff; margin: 0 0 1.5rem 0; font-size: 1.25em;">Space</h2>
                <div class="collection-description">
                    <p>${t('semantic.spaceDesc')}</p>
                    <p>${t('semantic.spaceUsage')}</p>
                </div>
            `;
        }
        return '';
    };
    
    let tablesHtml = pageIntro;
    collectionNames.forEach((collName) => {
        const groups = collectionMap[collName] || {};
        const groupOrder = [''].concat(Object.keys(groups).filter((g) => g && (groups[g]?.length || 0) > 0));
        
        // Add collection description (with title)
        const collDesc = getCollectionDesc(collName, scopeLabel);
        if (collDesc) {
            tablesHtml += collDesc;
        } else {
            // If no description, just add title
            tablesHtml += `<h2 id="w3c-coll-${collName}" style="background: #f8f9fa; padding: 0.75rem 1rem; border-radius: 6px; border-left: 5px solid #1484ff; margin: 0 0 1.5rem 0; font-size: 1.25em;">${collName}</h2>`;
        }
        groupOrder.forEach((groupName) => {
            const rows = groups[groupName] || [];
            if (!rows.length) return;
            const modeColumns = MODE_SUFFIXES.filter(m => rows.some((r: any) => r.modes[m]));
            const headers = modeColumns.length
                ? modeColumns.map(m => `<th style="background: #fafafa;">${t(`common.${m}`)}</th>`).join('')
                : `<th style="background: #fafafa;">${t('common.value')}</th>`;
            const heading = groupName ? `<h3 id="w3c-group-${collName}-${groupName.replace(/\\s+/g,'-')}" style="margin: 1.5rem 0 0.75rem; color:#444;">${groupName}</h3>` : '';
            tablesHtml += `${heading}
                <table class="api-table" style="margin-bottom: 2rem; width: 100%;">
                    <thead>
                        <tr>
                            <th style="width: 260px; background: #fafafa;">${t('common.tokenName')}</th>
                            ${headers}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map((r: any) => renderW3CRow(r, modeColumns)).join('')}
                    </tbody>
                </table>`;
        });
    });
    
    // Add usage guidance for Primitives
    if (scopeLabel === 'Primitives') {
        tablesHtml += `
            <div class="usage-guidance">
                <h3>${t('primitives.whenToUse')}</h3>
                <div class="usage-grid">
                    <div class="usage-do">
                        <h4>${t('primitives.useDo')}</h4>
                        <ul>
                            <li>${t('primitives.useDoItem1')}</li>
                            <li>${t('primitives.useDoItem2')}</li>
                            <li>${t('primitives.useDoItem3')}</li>
                        </ul>
                    </div>
                    <div class="usage-dont">
                        <h4>${t('primitives.useDont')}</h4>
                        <ul>
                            <li>${t('primitives.useDontItem1')}</li>
                            <li>${t('primitives.useDontItem2')}</li>
                            <li>${t('primitives.useDontItem3')}</li>
                        </ul>
                    </div>
                </div>
                
                <div class="example-comparison">
                    <div class="example-bad">
                        <h5>${t('primitives.exampleBad')}</h5>
                        <pre><code>.button {
  background: var(--kds-pri.colors.base.blue);
  padding: var(--kds-pri.space.space-16);
}</code></pre>
                        <p>${t('primitives.exampleBadReason')}</p>
                    </div>
                    <div class="example-good">
                        <h5>${t('primitives.exampleGood')}</h5>
                        <pre><code>.button {
  background: var(--kds-comp.states.primary.opacity-16.light);
  padding: var(--kds-sem.space.row.height);
}</code></pre>
                        <p>${t('primitives.exampleGoodReason')}</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Add modes explanation for Semantic
    if (scopeLabel === 'Semantic') {
        tablesHtml += `
            <section class="usage-guidance">
                <h3>${t('semantic.modesTitle')}</h3>
                <p>${t('semantic.modesIntro')}</p>
                
                <div class="example-comparison">
                    <div class="example-good" style="border-color: #1484ff;">
                        <h5>${t('common.light')}</h5>
                        <code>semantic.key.black.light</code><br>
                        → <code>{primitive.colors.base.black}</code><br>
                        → <span style="background:#000; color:#fff; padding:2px 6px;">#000000</span>
                    </div>
                    <div class="example-good" style="border-color: #666;">
                        <h5>${t('common.dark')}</h5>
                        <code>semantic.key.black.dark</code><br>
                        → <code>{primitive.colors.base.white}</code><br>
                        → <span style="background:#fff; color:#000; padding:2px 6px; border:1px solid #ddd;">#FFFFFF</span>
                    </div>
                </div>
                
                <p>${t('semantic.modesImpl')}</p>
            </section>
        `;
    }
    
    // Add states pattern for Components
    if (scopeLabel === 'Components') {
        tablesHtml += `
            <div class="states-pattern">
                <h3>${t('components.statesTitle')}</h3>
                <p>${t('components.statesIntro')}</p>
                
                <div class="states-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Estado</th>
                                <th>Cuándo se aplica</th>
                                <th>Ejemplo de token</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>primary</code></td>
                                <td>${t('states.default')}</td>
                                <td><code>components.states.primary.opacity-08.light</code></td>
                            </tr>
                            <tr>
                                <td><code>primary (hover)</code></td>
                                <td>${t('states.hover')}</td>
                                <td><code>components.states.primary.opacity-12.light</code></td>
                            </tr>
                            <tr>
                                <td><code>primary (pressed)</code></td>
                                <td>${t('states.pressed')}</td>
                                <td><code>components.states.primary.opacity-16.light</code></td>
                            </tr>
                            <tr>
                                <td><code>secondary</code></td>
                                <td>${t('states.default')}</td>
                                <td><code>components.states.secondary.opacity-08.dark</code></td>
                            </tr>
                            <tr>
                                <td><code>on-primary</code></td>
                                <td>${t('states.focus')}</td>
                                <td><code>components.states.on-primary.opacity-12.light</code></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <p>${t('components.statesWarning')}</p>
            </div>
        `;
    }
    
    // Add footer with metadata
    tablesHtml += `
        <footer class="token-page-footer">
            <p>${t('common.generatedFrom')}</p>
            <p>${t('common.format')}</p>
        </footer>
    `;

    return `
        <main>
            <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 2rem;">
                <h1>${scopeLabel} Tokens (W3C)</h1>
                <span style="color: #999; font-size: 0.8em; font-weight: 600;">SINGLE SOURCE OF TRUTH: FIGMA</span>
            </div>
            <div style="display: grid; grid-template-columns: 240px 1fr; gap: 3rem;">
                <aside style="position: sticky; top: 2rem; height: fit-content;">
                    <h5 style="margin: 0 0 1rem; color: #666; font-size: 0.8em; text-transform: uppercase;">${t('common.collections')}</h5>
                    <ul style="list-style: none; padding: 0; margin: 0;">${aside}</ul>
                </aside>
                <section>
                    ${tablesHtml}
                </section>
            </div>
        </main>
    `;
};

const renderPropTable = (props: any[]) => {
  if (!props || props.length === 0) return '<p>No properties.</p>';
  return `
    <table class="api-table">
      <thead><tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
      <tbody>
        ${props.map((p: any) => `
          <tr>
            <td><code>${p.name}</code>${p.required ? ' *' : ''}</td>
            <td>${p.type}${p.allowedValues ? `<br><small>[${p.allowedValues.join(', ')}]</small>` : ''}</td>
            <td>${p.default !== undefined ? `<code>${JSON.stringify(p.default)}</code>` : '-'}</td>
            <td>${p.description || ''}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
};

const state: Record<string, any> = {};

const renderControl = (prop: any, value: any, tagName: string, allProps: any) => {
  const handler = `window.updateState('${tagName}', '${prop.name}', this.value, '${prop.type}')`;
  if (prop.type === 'enum') {
    return `
      <div class="control-group">
        <label>${prop.displayName || prop.name}</label>
        <select onchange="${handler}">${prop.allowedValues?.map((v: string) => `<option value="${v}" ${v === value ? 'selected' : ''}>${v}</option>`).join('')}</select>
      </div>
    `;
  }
  if (prop.type === 'boolean') {
    const boolHandler = `window.updateState('${tagName}', '${prop.name}', this.checked, '${prop.type}')`;
    return `<div class="control-group checkbox-group"><label>${prop.displayName || prop.name}</label><input type="checkbox" ${value ? 'checked' : ''} onchange="${boolHandler}"></div>`;
  }
  return `<div class="control-group"><label>${prop.displayName || prop.name}</label><input type="text" value="${value || ''}" oninput="${handler}"></div>`;
};



// --- Framework Snippet Logic ---

const generateFrameworkCode = (framework: 'react' | 'angular' | 'blazor' | 'web-component', tag: string, props: any) => {
  const componentName = tag.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  
  if (framework === 'web-component') {
      let code = `<${tag}`;
      Object.entries(props).forEach(([key, value]) => {
        if (key === 'state' && value === 'enabled') return;
        const attrName = toKebabCase(key);
        if (value === false) return;
        if (value === true) code += ` ${attrName}`;
        else code += ` ${attrName}="${value}"`; 
      });
      code += `></${tag}>`;
      return code;
  }
  else if (framework === 'react') {
    let propsStr = '';
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'state' && value === 'enabled') return;
      if (value === false) return;
      
      propsStr += '\n    ';
      if (value === true) propsStr += `${key}={true}`;
      else if (typeof value === 'string') propsStr += `${key}="${value}"`;
      else if (typeof value === 'number') propsStr += `${key}={${value}}`;
    });

    return `import { ${componentName} } from './wrappers/react/${componentName}';

<${componentName} ${propsStr}
    onKdsClick={(e) => console.log(e)} 
/>`;
  } 
  else if (framework === 'angular') {
    let propsStr = '';
    Object.entries(props).forEach(([key, value]) => {
        if (key === 'state' && value === 'enabled') return;
        if (value === false) return;
        
        const attrName = toKebabCase(key);
        propsStr += '\n        ';
        if (value === true) propsStr += `[${key}]="true"`; // Angular property binding for boolean
        else propsStr += `${attrName}="${value}"`;
    });

    return `import { ${componentName}Component } from './wrappers/angular/${tag}.component';

@Component({
  imports: [${componentName}Component],
  template: \`
    <${tag}-ng ${propsStr}
        (kds-click)="handleClick($event)">
    </${tag}-ng>
  \`
})`;
  }
  else if (framework === 'blazor') {
      let propsStr = '';
      Object.entries(props).forEach(([key, value]) => {
          if (key === 'state' && value === 'enabled') return;
          if (value === false) return;
          
          // Capitalize for Blazor
          const attrName = key.charAt(0).toUpperCase() + key.slice(1);
          propsStr += '\n    ';
          if (value === true) propsStr += `${attrName}="true"`;
          else propsStr += `${attrName}="${value}"`;
      });

      return `<${componentName} ${propsStr}
    OnKdsClick="HandleClick" />`;
  }

  return '';
};

// Simple Regex-based Syntax Highlighter
const highlightHtml = (code: string) => {
    // First, escape basic HTML to avoid messing up the DOM
    const escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Single-pass tokenizer regex
    // 1. Comments: // ... or /* ... */
    // 2. Keywords: import, from, const, return, @Component
    // 3. Tags: &lt;tag or &lt;/tag
    // 4. Attributes: space + name + =
    // 5. Strings: "value" or 'value' or `value`
    // 6. Expression: {value}
    // 7. Tag End: &gt; or /&gt;
    const tokenRegex = /(\/\/.*$|\/\*[\s\S]*?\*\/)|(\b(import|from|const|return|export|class|interface|void)\b|@[a-zA-Z]+)|(&lt;\/?)([a-zA-Z0-9-]+)|(\s+)([a-zA-Z0-9-\[\]()]+)(=)|(["'`])((?:(?=(\\?))\11.)*?)\9|({)([^}]*)(})|(\/?&gt;)/gm;

    return escaped.replace(tokenRegex, (match, 
        p1Comment,
        p2Keyword, p3InnerKeyword,
        p4TagStart, p5TagName, 
        p6AttrSpace, p7AttrName, p8AttrEq, 
        p9Quote, p10StringVal, p11Esc,
        p12ExprStart, p13ExprVal, p14ExprEnd,
        p15TagEnd) => {
        
        if (p1Comment) return `<span class="token comment" style="color: #6a737d font-style: italic;">${p1Comment}</span>`;
        if (p2Keyword) return `<span class="token keyword" style="color: #c678dd;">${p2Keyword}</span>`;
        
        if (p4TagStart) {
            return `<span class="token punctuation">${p4TagStart}</span><span class="token tag">${p5TagName}</span>`;
        }
        if (p7AttrName) {
            return `${p6AttrSpace}<span class="token attr-name">${p7AttrName}</span><span class="token punctuation">${p8AttrEq}</span>`;
        }
        if (p9Quote) {
            return `<span class="token punctuation">${p9Quote}</span><span class="token attr-value">${p10StringVal}</span><span class="token punctuation">${p9Quote}</span>`;
        }
        if (p12ExprStart) {
            return `<span class="token punctuation">${p12ExprStart}</span><span class="token attr-value">${p13ExprVal}</span><span class="token punctuation">${p14ExprEnd}</span>`;
        }
        if (p15TagEnd) {
            return `<span class="token punctuation">${p15TagEnd}</span>`;
        }
        return match;
    });
};

(window as any).copySnippet = (id: string) => {
    const code = document.getElementById(id)?.innerText;
    if (code) {
        navigator.clipboard.writeText(code).then(() => {
            const btn = document.getElementById(`btn-${id}`);
            if (btn) {
                const original = btn.innerHTML;
                btn.innerHTML = 'Copied!';
                setTimeout(() => btn.innerHTML = original, 2000);
            }
        });
    }
};

const renderFrameworkTabs = (tag: string, props: any) => {
    const webCode = generateFrameworkCode('web-component', tag, props);
    const angularCode = generateFrameworkCode('angular', tag, props);
    const blazorCode = generateFrameworkCode('blazor', tag, props);
    const reactCode = generateFrameworkCode('react', tag, props);

    return `
    <div class="framework-tabs">
        <div class="framework-tabs-header">
            <button class="tab-btn active" onclick="switchTab('web-component')">Web Component</button>
            <button class="tab-btn" onclick="switchTab('angular')">Angular</button>
            <button class="tab-btn" onclick="switchTab('blazor')">Blazor</button>
            <button class="tab-btn" onclick="switchTab('react')">React</button>
        </div>
        
        <div id="tab-web-component" class="tab-content active">
            <button id="btn-raw-web-component" class="copy-btn" onclick="copySnippet('raw-web-component')">Copy</button>
            <div style="position: absolute; top: 0.5rem; right: 4.5rem; color: #999; font-size: 0.7em; text-transform: uppercase; z-index: 5;">HTML Output</div>
            <pre><code class="playground-code-content">${highlightHtml(webCode)}</code></pre>
            <div id="raw-web-component" style="display:none">${webCode}</div>
        </div>
        
        <div id="tab-angular" class="tab-content">
            <button id="btn-raw-angular" class="copy-btn" onclick="copySnippet('raw-angular')">Copy</button>
            <div style="position: absolute; top: 0.5rem; right: 4.5rem; color: #999; font-size: 0.7em; text-transform: uppercase; z-index: 5;">HTML Output</div>
            <pre><code class="playground-code-content">${highlightHtml(angularCode)}</code></pre>
             <div id="raw-angular" style="display:none">${angularCode}</div>
        </div>
        
        <div id="tab-blazor" class="tab-content">
            <button id="btn-raw-blazor" class="copy-btn" onclick="copySnippet('raw-blazor')">Copy</button>
            <div style="position: absolute; top: 0.5rem; right: 4.5rem; color: #999; font-size: 0.7em; text-transform: uppercase; z-index: 5;">HTML Output</div>
            <pre><code class="playground-code-content">${highlightHtml(blazorCode)}</code></pre>
             <div id="raw-blazor" style="display:none">${blazorCode}</div>
        </div>
        
        <div id="tab-react" class="tab-content">
            <button id="btn-raw-react" class="copy-btn" onclick="copySnippet('raw-react')">Copy</button>
            <div style="position: absolute; top: 0.5rem; right: 4.5rem; color: #999; font-size: 0.7em; text-transform: uppercase; z-index: 5;">HTML Output</div>
            <pre><code class="playground-code-content">${highlightHtml(reactCode)}</code></pre>
             <div id="raw-react" style="display:none">${reactCode}</div>
        </div>
    </div>
    `;
};

(window as any).switchTab = (tab: string) => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    const buttons = Array.from(document.querySelectorAll('.tab-btn'));
    const targetBtn = buttons.find(b => b.textContent?.toLowerCase().includes(tab.replace('-', ' ')));
    if (targetBtn) targetBtn.classList.add('active');

    document.getElementById(`tab-${tab}`)?.classList.add('active');
};


// --- End Framework Logic ---

(window as any).updateState = (tag: string, prop: string, value: any, type: string) => {
  state[tag][prop] = value;
  const component = data.components.find(c => c.tag === tag);
  if (component) renderPlaygroundPreview(component);
};

const renderPlaygroundPreview = (component: any) => {
  const currentProps = state[component.tag];
  const attributes = Object.entries(currentProps)
    .map(([key, val]) => {
        if (key === 'state' && val === 'enabled') return '';
        const attrName = toKebabCase(key);
        if (val === false) return '';
        if (val === true) return ` ${attrName}`;
        if (val === '' || val === null || val === undefined) return '';
        return ` ${attrName}="${val}"`;
    }).join('');

  const tagString = `<${component.tag}${attributes}></${component.tag}>`;
  const previewEl = document.querySelector('.playground-preview-content');
  if (previewEl) previewEl.innerHTML = tagString;

  // Update Framework Snippets Live
  const webCompCode = generateFrameworkCode('web-component', component.tag, currentProps);
  const reactCode = generateFrameworkCode('react', component.tag, currentProps);
  const angularCode = generateFrameworkCode('angular', component.tag, currentProps);
  const blazorCode = generateFrameworkCode('blazor', component.tag, currentProps);

  // Update Displayed Code (Highlighted)
  const webTab = document.querySelector('#tab-web-component code');
  if (webTab) webTab.innerHTML = highlightHtml(webCompCode);
  
  const reactTab = document.querySelector('#tab-react code');
  if (reactTab) reactTab.innerHTML = highlightHtml(reactCode);
  
  const angularTab = document.querySelector('#tab-angular code');
  if (angularTab) angularTab.innerHTML = highlightHtml(angularCode);

  const blazorTab = document.querySelector('#tab-blazor code');
  if (blazorTab) blazorTab.innerHTML = highlightHtml(blazorCode);

  // Update Raw Code (for Copy)
  const webRaw = document.querySelector('#raw-web-component');
  if (webRaw) webRaw.textContent = webCompCode;

  const reactRaw = document.querySelector('#raw-react');
  if (reactRaw) reactRaw.textContent = reactCode;

  const angularRaw = document.querySelector('#raw-angular');
  if (angularRaw) angularRaw.textContent = angularCode;

  const blazorRaw = document.querySelector('#raw-blazor');
  if (blazorRaw) blazorRaw.textContent = blazorCode;
};

// --- Visual Matrix: Variants × States ---
const renderVisualMatrix = (component: any) => {
  // For Button: appearances and states
  const appearanceProp = component.properties.find((p: any) => p.name === 'appearance');
  const stateProp = component.properties.find((p: any) => p.name === 'state');
  
  if (!appearanceProp || !stateProp || component.tag !== 'kds-button') {
    return ''; // Only render for Button
  }

  const appearances = appearanceProp.allowedValues || ['filled'];
  const states = stateProp.allowedValues || ['enabled'];

  const matrix = appearances
    .map((appearance: string) => `
      <div style="margin-bottom: 2rem;">
        <h4 style="margin: 0 0 1rem; font-size: 0.95em; color: #333;"><code>${appearance}</code></h4>
        <div style="display: grid; grid-template-columns: repeat(${states.length}, 1fr); gap: 1rem; margin-bottom: 2rem;">
          ${states
            .map((state: string) => {
              const attrs = `appearance="${appearance}" state="${state}" label="Button" has-icon="true" icon="add"`;
              return `
                <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 1.5rem; background: #fafafa; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 120px;">
                  <div style="margin-bottom: 0.5rem; font-size: 0.8em; color: #666; font-weight: 500;">${state}</div>
                  <kds-button ${attrs}></kds-button>
                </div>
              `;
            })
            .join('')}
        </div>
      </div>
    `)
    .join('');

  return `
    <h2 style="margin-top: 3rem;">Visual Matrix: Variants × States</h2>
    <p style="color: #666; margin-bottom: 1.5rem;">All appearance variants with all interaction states.</p>
    <div style="background: white; border: 1px solid #eee; border-radius: 8px; padding: 2rem;">
      ${matrix}
    </div>
  `;
};

const renderComponent = (tag: string) => {
  const component = data.components.find(c => c.tag === tag);
  if (!component) return `<main><h1>Component not found</h1></main>`;

  if (!state[component.tag]) {
    state[component.tag] = {};
    component.properties.forEach((p: any) => {
      state[component.tag][p.name] = p.default;
    });
  }

  // Resolve tokens for this component
  const tokensHtml = component.tokens && component.tokens.length > 0 ? `
    <h2 style="margin-top: 3rem;">Design Tokens</h2>
    <p style="color: #666; margin-bottom: 1.5rem;">This component is built using the following design tokens from Figma.</p>
    <table class="api-table">
        <thead>
            <tr>
                <th>Token</th>
                <th>Light</th>
                <th>Dark</th>
                <th>CSS Variable</th>
            </tr>
        </thead>
        <tbody>
            ${component.tokens.map((tName: string) => {
                const cssTarget = normalizeCss(tName);
                const canonical = resolveCanonicalSid(cssTarget);
                if (!canonical) return `<tr><td><code>${tName}</code></td><td colspan="2"><em>Not found</em></td><td><code>${cssTarget}</code></td></tr>`;
                const foundVar = allVariables[canonical.sid];
                const levelData = (tokensData as any)[canonical.level];
                const foundColl = levelData?.collections?.[foundVar?.variableCollectionId];
                if (!foundVar || !foundColl) return `<tr><td><code>${tName}</code></td><td colspan="2"><em>Not found</em></td><td><code>${cssTarget}</code></td></tr>`;

                const isColor = foundVar.resolvedType === 'COLOR';
                return `
                    <tr>
                        <td><strong>${(foundVar.name || '').split('/').pop()}</strong></td>
                        ${foundColl.modes.map((m: any) => {
                            const { chainHtml, resolvedValue } = resolveAliasChainForMode(foundVar, m.modeId);
                            const sw = isColor ? `<div style="width:14px; height:14px; background:${resolvedValue}; border:1px solid #ddd; border-radius:2px;"></div>` : '';
                            return `<td><div style="font-size:0.85em; color:#555;">${chainHtml}</div><div style="display:flex; align-items:center; gap:6px; margin-top:4px;">${sw}<code>${resolvedValue}</code></div></td>`;
                        }).join('')}
                        <td><code>${canonical.css}</code></td>
                    </tr>
                `;
            }).join('')}
        </tbody>
    </table>
  ` : '';

  return `
    <main>
      <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #eee; padding-bottom: 1rem; margin-bottom: 2rem;">
          <h1>${component.name}</h1>
          <code style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 0.8em;">&lt;${component.tag}&gt;</code>
      </div>
      
      <p style="font-size: 1.1em; color: #444; margin-bottom: 2rem;">${component.description}</p>
      
      <div class="playground" style="background: white; border: 1px solid #eee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div class="playground-preview" style="padding: 4rem; background: #fafafa; display: flex; justify-content: center; border-bottom: 1px solid #eee;">
            <div class="playground-preview-content"></div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 300px;">
            ${renderFrameworkTabs(component.tag, state[component.tag])}
            
            <div class="playground-controls" style="padding: 1.5rem; background: #fff;">
              <h4 style="margin: 0 0 1rem; font-size: 0.8em; text-transform: uppercase; color: #999;">Interactive Controls</h4>
              ${component.properties.map((p: any) => renderControl(p, state[component.tag][p.name], component.tag, state[component.tag])).join('')}
            </div>
        </div>
      </div>

      ${tokensHtml}

      <h2 style="margin-top: 3rem;">Properties</h2>
      ${renderPropTable(component.properties)}

      ${renderVisualMatrix(component)}

      ${component.events && component.events.length > 0 ? `
        <h2 style="margin-top: 3rem;">Events</h2>
        <table class="api-table">
          <thead><tr><th>Event Name</th><th>Description</th><th>Payload Type</th></tr></thead>
          <tbody>
            ${component.events.map((e: any) => `
              <tr>
                <td><code>${e.name}</code></td>
                <td>${e.description}</td>
                <td><code>${e.payloadType || 'void'}</code></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      ${component.slots && component.slots.length > 0 ? `
        <h2 style="margin-top: 3rem;">Slots</h2>
        <table class="api-table">
          <thead><tr><th>Slot Name</th><th>Description</th></tr></thead>
          <tbody>
            ${component.slots.map((s: any) => `
              <tr>
                <td><code>${s.name}</code></td>
                <td>${s.description}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3 style="margin-top: 2rem;">Slot Examples</h3>
        ${component.tag === 'kds-button' ? `
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem;">
            <div>
              <h4 style="margin: 0 0 0.5rem; font-size: 0.9em; color: #666;">Default slot (label replacement)</h4>
              <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 1.5rem; background: #fafafa; margin-bottom: 0.5rem;">
                <kds-button appearance="filled">
                  Custom Label via Slot
                </kds-button>
              </div>
              <pre style="font-size: 0.8em;"><code>&lt;kds-button appearance="filled"&gt;
  Custom Label via Slot
&lt;/kds-button&gt;</code></pre>
            </div>
            <div>
              <h4 style="margin: 0 0 0.5rem; font-size: 0.9em; color: #666;">Icon slot (custom icon)</h4>
              <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 1.5rem; background: #fafafa; margin-bottom: 0.5rem;">
                <kds-button appearance="filled" label="Download">
                  <span slot="icon" style="font-size: 18px;">⬇️</span>
                </kds-button>
              </div>
              <pre style="font-size: 0.8em;"><code>&lt;kds-button appearance="filled" label="Download"&gt;
  &lt;span slot="icon"&gt;⬇️&lt;/span&gt;
&lt;/kds-button&gt;</code></pre>
            </div>
          </div>
        ` : ''}
      ` : ''}
    </main>
  `;
};

let backToTopBtn: HTMLButtonElement | null = null;
const ensureBackToTopButton = () => {
    if (backToTopBtn) return;
    backToTopBtn = document.createElement('button');
    backToTopBtn.textContent = 'Top';
    backToTopBtn.style.position = 'fixed';
    backToTopBtn.style.right = '20px';
    backToTopBtn.style.bottom = '20px';
    backToTopBtn.style.padding = '10px 14px';
    backToTopBtn.style.borderRadius = '999px';
    backToTopBtn.style.border = '1px solid #ddd';
    backToTopBtn.style.background = '#1484ff';
    backToTopBtn.style.color = '#fff';
    backToTopBtn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
    backToTopBtn.style.cursor = 'pointer';
    backToTopBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(backToTopBtn);
};

(window as any).updateState = (tag: string, prop: string, value: any, type: string) => {
  state[tag][prop] = value;
  const component = data.components.find(c => c.tag === tag);
  if (component) renderPlaygroundPreview(component);
};

const renderTokensOverview = () => {
  const exampleCode1 = `{
  "primitive": {
    "colors": {
      "base": {
        "blue": {
          "$type": "color",
          "$value": "#007AFF"
        }
      }
    }
  }
}`;

  const aliasCode1 = `{
  "semantic": {
    "colors": {
      "primary": {
        "$type": "color",
        "$value": "{primitive.colors.base.blue}"
      }
    }
  }
}`;

  const aliasCode2 = `{
  "primitive": {
    "colors": {
      "base": {
        "blue": {
          "$type": "color",
          "$value": "#007AFF"
        }
      }
    }
  }
}`;

  const consumptionCode1 = `{
  "primitive": {
    "colors": {
      "base": {
        "blue": {
          "$type": "color",
          "$value": "#007AFF"
        }
      }
    }
  }
}`;

  const consumptionCode2 = `:root {
  --kds-primitive-colors-base-blue: #007AFF;
}

.button {
  background: var(--kds-primitive-colors-base-blue);
}`;

  return `
    <main class="overview">
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "name": "KDS-AI Design Tokens Documentation",
        "description": "W3C Design Tokens generated from Figma Variables",
        "version": "1.0.0",
        "sourceOrganization": "KDS-AI",
        "sourceOfTruth": "Figma Variables",
        "tokenFormat": "W3C Design Tokens 2025.10",
        "tokenLayers": ["primitive", "semantic", "components"],
        "editPolicy": "Figma-only, W3C artifacts are generated"
      }
      </script>
      
      <div class="overview-hero">
        <div class="hero-content">
          <p class="eyebrow">${t('overview.subtitle')}</p>
          <h1>${t('overview.title')}</h1>
          <p class="hero-description">${t('overview.description')}</p>
        </div>
      </div>

      <section class="overview-section ssot-callout">
        <div class="section-header">
          <h2>${t('overview.ssot.title')}</h2>
          <p>${t('overview.ssot.intro')}</p>
          <p>${t('overview.ssot.workflow')}</p>
        </div>
        
        <div class="ssot-pipeline">
          <div class="pipeline-step">
            <div class="step-icon">🎨</div>
            <h4>${t('overview.ssot.step1Title')}</h4>
            <p>${t('overview.ssot.step1Desc')}</p>
            <code>figma/variables.*.json</code>
          </div>
          <div class="pipeline-arrow">→ export</div>
          <div class="pipeline-step">
            <div class="step-icon">📦</div>
            <h4>${t('overview.ssot.step2Title')}</h4>
            <p>${t('overview.ssot.step2Desc')}</p>
            <code>dist/tokens/**/*.w3c.json</code>
          </div>
          <div class="pipeline-arrow">→ consume</div>
          <div class="pipeline-step">
            <div class="step-icon">💻</div>
            <h4>${t('overview.ssot.step3Title')}</h4>
            <p>${t('overview.ssot.step3Desc')}</p>
            <code>--kds-*</code>
          </div>
        </div>
        
        <div class="ssot-warning">
          ${t('overview.ssot.warning')}
        </div>
      </section>

      <section class="overview-section">
        <div class="section-header">
          <h2>${t('overview.whatAreTokens.title')}</h2>
          <p>${t('overview.whatAreTokens.intro')}</p>
          <p>${t('overview.whatAreTokens.w3c')}</p>
        </div>
        
        <div class="token-example">
          <div class="token-example-header">
            <span class="token-badge">Primitives</span>
            <code class="token-name">primitive.colors.base.blue</code>
          </div>
          <div class="token-example-body" style="position: relative;">
            <button class="copy-btn" onclick="copySnippet('raw-example-1')">Copy</button>
            <pre class="code-block"><code class="playground-code-content">${highlightHtml(exampleCode1)}</code></pre>
            <div id="raw-example-1" style="display:none">${exampleCode1}</div>
            <div class="token-preview">
              <div class="color-swatch" style="background: #007AFF;"></div>
              <span>#007AFF</span>
            </div>
          </div>
        </div>
        <p class="hint-text">Este ejemplo muestra un token primitivo de color. El valor hexadecimal <code>#007AFF</code> es el color azul base del sistema. Los tokens primitivos son la capa más baja de la jerarquía y contienen valores literales sin semántica de aplicación.</p>
      </section>

      <section class="overview-section">
        <div class="section-header">
          <h2>${t('overview.hierarchy.title')}</h2>
          <p>${t('overview.hierarchy.intro')}</p>
          <p>${t('overview.hierarchy.flow')}</p>
        </div>

        <div class="hierarchy-flow">
          <div class="hierarchy-level">
            <div class="level-badge primitive">Primitives</div>
            <h3>${t('overview.hierarchy.primitives')}</h3>
            <p>${t('overview.hierarchy.primitivesDesc')}</p>
            <p>${t('overview.hierarchy.primitivesDetail')}</p>
            <div class="example-tokens">
              <code>primitive.colors.base.blue</code>
              <code>primitive.colors.base.red</code>
              <code>primitive.space.space-16</code>
            </div>
          </div>

          <div class="hierarchy-arrow">→</div>

          <div class="hierarchy-level">
            <div class="level-badge semantic">Semantic</div>
            <h3>${t('overview.hierarchy.semanticTitle')}</h3>
            <p>${t('overview.hierarchy.semanticDesc')}</p>
            <p>${t('overview.hierarchy.semanticDetail')}</p>
            <div class="example-tokens">
              <code>semantic.space.canvas.regular</code>
              <code>semantic.space.row.height</code>
              <code>semantic.typeface.brand.baseline</code>
            </div>
          </div>

          <div class="hierarchy-arrow">→</div>

          <div class="hierarchy-level">
            <div class="level-badge component">Components</div>
            <h3>${t('overview.hierarchy.componentsTitle')}</h3>
            <p>${t('overview.hierarchy.componentsDesc')}</p>
            <p>${t('overview.hierarchy.componentsDetail')}</p>
            <div class="example-tokens">
              <code>components.states.primary.opacity-08.light</code>
              <code>components.states.secondary.opacity-12.dark</code>
            </div>
          </div>
        </div>
      </section>

      <section class="overview-section">
        <div class="section-header">
          <h2>Alias y referencias</h2>
          <p>Los tokens pueden referenciar otros tokens usando la sintaxis de llaves <code>{token.path}</code>, creando relaciones semánticas y habilitando theming. Esta capacidad es fundamental para mantener la coherencia del sistema y permitir cambios globales con mínima intervención.</p>
          <p>Cuando un token referencia a otro, se crea un alias. El token referenciado puede ser de cualquier nivel de la jerarquía, pero las mejores prácticas recomiendan que los tokens de nivel superior referencien a los de nivel inferior. Esto crea una cadena de dependencias clara y predecible que facilita el mantenimiento y la comprensión del sistema.</p>
          <p>Las referencias se resuelven en tiempo de compilación o runtime, dependiendo de la herramienta. Si un token primitivo cambia, todos los tokens que lo referencian (directa o indirectamente) se actualizan automáticamente, propagando el cambio a través de todo el sistema.</p>
        </div>

        <div class="alias-example">
          <div class="alias-chain">
            <div class="alias-step">
              <div class="step-label">Semantic</div>
              <div style="position: relative;">
                <button class="copy-btn" onclick="copySnippet('raw-alias-1')">Copy</button>
                <pre class="code-block small"><code class="playground-code-content">${highlightHtml(aliasCode1)}</code></pre>
                <div id="raw-alias-1" style="display:none">${aliasCode1}</div>
              </div>
              <p class="step-explanation">El token semántico <code>semantic.colors.primary</code> referencia al token primitivo usando la sintaxis <code>{primitive.colors.base.blue}</code>. Esto permite que el color primario del sistema pueda cambiar simplemente modificando la referencia, sin tocar los componentes que lo usan.</p>
            </div>
            <div class="alias-arrow">↓ referencia</div>
            <div class="alias-step">
              <div class="step-label">Primitives</div>
              <div style="position: relative;">
                <button class="copy-btn" onclick="copySnippet('raw-alias-2')">Copy</button>
                <pre class="code-block small"><code class="playground-code-content">${highlightHtml(aliasCode2)}</code></pre>
                <div id="raw-alias-2" style="display:none">${aliasCode2}</div>
              </div>
              <p class="step-explanation">El token primitivo contiene el valor literal del color. Este es el valor final que se resuelve cuando se sigue la cadena de referencias. Si cambiamos este valor, todos los tokens que lo referencian se actualizarán automáticamente.</p>
            </div>
          </div>
        </div>
        <p class="hint-text">Las cadenas de alias pueden ser profundas: un token de componente puede referenciar un semántico, que a su vez referencia un primitivo. El sistema resuelve estas cadenas automáticamente, pero es importante evitar referencias circulares que crearían bucles infinitos.</p>
      </section>

      <section class="overview-section alt-bg">
        <div class="section-header">
          <h2>Tipos de tokens</h2>
          <p>KDS-AI soporta múltiples tipos de tokens según la especificación W3C Design Tokens. Cada tipo tiene su propia estructura de valor y reglas de validación, permitiendo que las herramientas procesen y transformen los tokens correctamente según su propósito.</p>
          <p>Los tipos definen no solo el formato del valor sino también cómo debe interpretarse y transformarse. Por ejemplo, un token de tipo <code>color</code> puede convertirse a diferentes formatos (hex, rgba, hsl) según la plataforma objetivo, mientras que un token de tipo <code>dimension</code> puede convertirse de px a rem o a unidades nativas como dp/pt.</p>
        </div>

        <div class="token-types-grid">
          <div class="type-card">
            <div class="type-icon">🎨</div>
            <h3>Color</h3>
            <p>Los tokens de color representan valores de color en diferentes espacios de color (sRGB, Display P3, etc.). Incluyen colores base de la paleta, rampas de color con variaciones de luminosidad, y variantes temáticas para light/dark mode.</p>
            <p>Los tokens de color pueden ser valores literales (hex, rgba) o referencias a otros tokens de color. Esto permite crear sistemas de color complejos donde los colores semánticos referencian colores primitivos, facilitando el theming y la coherencia.</p>
            <code class="type-example">primitive.colors.base.blue</code>
          </div>
          <div class="type-card">
            <div class="type-icon">📏</div>
            <h3>Space</h3>
            <p>Los tokens de espacio definen distancias y dimensiones del sistema: márgenes, padding, gaps, y tamaños de elementos. Usan unidades relativas (rem) o absolutas (px) según el contexto.</p>
            <p>Los tokens de espacio crean una escala consistente que garantiza coherencia visual y facilita el diseño responsivo. Los valores se organizan típicamente en una escala (8px, 16px, 24px, etc.) que permite composición predecible.</p>
            <code class="type-example">primitive.space.space-16</code>
          </div>
          <div class="type-card">
            <div class="type-icon">✍️</div>
            <h3>Typography</h3>
            <p>Los tokens de tipografía definen estilos de texto completos incluyendo familia, tamaño, peso, line-height y letter-spacing. Pueden ser tokens compuestos que agrupan múltiples propiedades relacionadas.</p>
            <p>Estos tokens permiten crear sistemas tipográficos escalables donde los estilos de texto se definen una vez y se reutilizan en múltiples contextos. Facilitan la creación de variantes (headings, body, captions) manteniendo coherencia.</p>
            <code class="type-example">primitive.typescale.headline-large</code>
          </div>
          <div class="type-card">
            <div class="type-icon">🔤</div>
            <h3>Typeface</h3>
            <p>Los tokens de typeface definen las familias tipográficas del sistema. Pueden ser nombres de fuentes individuales o pilas de fuentes (font stacks) que especifican fuentes de respaldo.</p>
            <p>Estos tokens centralizan la gestión de fuentes, facilitando cambios de tipografía a nivel de sistema. También permiten definir variantes de marca donde diferentes productos pueden usar diferentes familias tipográficas.</p>
            <code class="type-example">primitive.typeface.brand</code>
          </div>
          <div class="type-card">
            <div class="type-icon">🔲</div>
            <h3>Shape</h3>
            <p>Los tokens de shape definen formas y bordes: radios de esquina, estilos de borde, y otras propiedades geométricas. Estos tokens crean coherencia visual en elementos con bordes redondeados o formas específicas.</p>
            <p>Los tokens de shape son especialmente útiles para crear sistemas de diseño modernos con esquinas redondeadas consistentes. Permiten ajustar el "feel" del diseño (más angular vs. más suave) cambiando solo los valores de los tokens.</p>
            <code class="type-example">primitive.shape.corner-radius</code>
          </div>
          <div class="type-card">
            <div class="type-icon">📊</div>
            <h3>States</h3>
            <p>Los tokens de estado definen variantes de componentes para diferentes estados de interacción: default, hover, pressed, disabled, focus, etc. Estos tokens referencian otros tokens (color, space, etc.) para crear variaciones coherentes.</p>
            <p>Los tokens de estado son cruciales para crear interfaces interactivas coherentes. Garantizan que todos los estados de un componente sigan las mismas reglas visuales y de accesibilidad, facilitando el mantenimiento y la consistencia.</p>
            <code class="type-example">components.states.button.default</code>
          </div>
        </div>
      </section>

      <section class="overview-section">
        <div class="section-header">
          <h2>Beneficios de los design tokens</h2>
          <p>Los design tokens proporcionan ventajas significativas tanto para equipos de diseño como de desarrollo, mejorando la eficiencia, calidad y mantenibilidad de los sistemas de diseño.</p>
        </div>

        <div class="benefits-grid">
          <div class="benefit-card">
            <h3>Consistencia</h3>
            <p>Una sola fuente de verdad que mantiene alineados diseño y código en todas las plataformas. Los tokens eliminan la necesidad de sincronización manual entre herramientas de diseño y código, reduciendo errores y desviaciones visuales. Cuando un diseñador actualiza un color en Figma, ese cambio se refleja automáticamente en todas las implementaciones.</p>
            <p>Esta consistencia se extiende más allá de los valores visuales: incluye comportamientos, animaciones y estados que deben ser coherentes en toda la aplicación. Los tokens garantizan que un botón se vea y comporte igual independientemente de dónde se use.</p>
          </div>
          <div class="benefit-card">
            <h3>Velocidad</h3>
            <p>Cambios atómicos que se propagan automáticamente sin retrabajo manual. Un ajuste en un token primitivo puede actualizar cientos de componentes instantáneamente, eliminando la necesidad de buscar y reemplazar valores en múltiples archivos.</p>
            <p>Los tokens también aceleran el proceso de diseño: los diseñadores pueden experimentar con variaciones temáticas simplemente cambiando referencias de tokens, sin necesidad de rediseñar componentes completos. Esto permite iteración rápida y validación de conceptos antes de implementar cambios costosos.</p>
          </div>
          <div class="benefit-card">
            <h3>Escalabilidad</h3>
            <p>Soporte para múltiples temas, marcas y plataformas sin duplicar componentes. Los tokens permiten crear variantes completas del sistema simplemente cambiando las referencias en la capa semántica, sin modificar código de componentes.</p>
            <p>Esta escalabilidad es crucial para organizaciones que gestionan múltiples productos o marcas. Un solo conjunto de componentes puede servir a diferentes marcas cambiando solo los tokens, reduciendo significativamente el esfuerzo de mantenimiento y permitiendo lanzar nuevas variantes rápidamente.</p>
          </div>
          <div class="benefit-card">
            <h3>Accesibilidad</h3>
            <p>Contraste, foco, tamaños y motion gobernados por tokens que cumplen WCAG 2.2. Los tokens de accesibilidad garantizan que todas las combinaciones de color cumplan con ratios de contraste mínimos, que los indicadores de foco sean siempre visibles, y que las animaciones respeten las preferencias del usuario.</p>
            <p>Al centralizar estos requisitos en tokens, se asegura que la accesibilidad no sea una preocupación secundaria sino una propiedad inherente del sistema. Los desarrolladores no necesitan recordar verificar contrastes o tamaños mínimos: los tokens ya los garantizan.</p>
          </div>
        </div>
      </section>

      <section class="overview-section alt-bg">
        <div class="section-header">
          <h2>Accesibilidad integrada</h2>
          <p>Los tokens de KDS-AI están diseñados con criterios de accesibilidad desde el inicio, siguiendo las pautas WCAG 2.2 y las mejores prácticas de ARIA. La accesibilidad no es una capa adicional sino una propiedad fundamental del sistema de tokens.</p>
          <p>Esta integración significa que los desarrolladores no necesitan preocuparse por verificar manualmente contrastes, tamaños mínimos o visibilidad de foco: los tokens ya garantizan estos requisitos. Esto reduce significativamente el riesgo de crear interfaces inaccesibles y asegura que todos los usuarios puedan usar los productos construidos con KDS-AI.</p>
        </div>

        <div class="a11y-grid">
          <div class="a11y-item">
            <h4>Contraste de color</h4>
            <p>Todos los tokens de color en KDS-AI cumplen con los ratios de contraste WCAG 2.2 AA (mínimo 4.5:1 para texto normal, 3:1 para texto grande) y muchos alcanzan el nivel AAA (7:1 para texto normal, 4.5:1 para texto grande).</p>
            <p>Las combinaciones texto-superficie están pre-validadas, lo que significa que cualquier uso de tokens de color garantiza legibilidad. Los tokens de estado (hover, pressed, disabled) mantienen estos ratios incluso en sus variaciones, asegurando que la accesibilidad no se degrade en interacciones.</p>
          </div>
          <div class="a11y-item">
            <h4>Indicadores de foco</h4>
            <p>Tokens dedicados definen indicadores de foco visibles con color, grosor y offset específicos. Estos tokens garantizan que todos los elementos interactivos tengan un foco claramente visible, cumpliendo con el criterio WCAG 2.4.7 (Focus Visible).</p>
            <p>Los tokens de foco incluyen variantes para diferentes contextos (light mode, dark mode, high contrast) asegurando visibilidad en todos los escenarios. El grosor mínimo y el offset garantizan que el foco sea perceptible incluso para usuarios con visión reducida.</p>
          </div>
          <div class="a11y-item">
            <h4>Tipografía legible</h4>
            <p>Las escalas tipográficas usan unidades relativas (rem) que respetan las preferencias del usuario, line-heights generosos (mínimo 1.5) que mejoran la legibilidad, y tamaños mínimos (16px base) que aseguran que el texto sea legible sin zoom.</p>
            <p>Los tokens de tipografía también incluyen variantes para diferentes contextos de lectura (pantalla, impresión, alta densidad) y soportan ajustes de tamaño de fuente del sistema operativo, permitiendo que los usuarios personalicen su experiencia según sus necesidades.</p>
          </div>
          <div class="a11y-item">
            <h4>Áreas táctiles</h4>
            <p>Los spacing tokens aseguran que todos los elementos interactivos tengan hit areas de al menos 44x44 píxeles, cumpliendo con las recomendaciones de accesibilidad táctil. Esto es especialmente importante en dispositivos móviles donde la precisión del toque es menor.</p>
            <p>Los tokens de padding y margin están diseñados para crear estas áreas táctiles de forma natural, sin necesidad de cálculos manuales. Esto garantiza que botones, enlaces y otros controles sean fáciles de activar para todos los usuarios.</p>
          </div>
          <div class="a11y-item">
            <h4>Motion y animaciones</h4>
            <p>Las duraciones y curvas de animación están tokenizadas y respetan automáticamente la preferencia <code>prefers-reduced-motion</code> del usuario. Los tokens de motion incluyen variantes "reduced" que proporcionan transiciones más cortas o eliminadas para usuarios sensibles al movimiento.</p>
            <p>Esta implementación cumple con el criterio WCAG 2.3.3 (Animation from Interactions), asegurando que las animaciones no causen mareo, náuseas o distracción. Los tokens también limitan la duración máxima de animaciones y evitan efectos parpadeantes que podrían causar convulsiones.</p>
          </div>
        </div>
      </section>

      <section class="overview-section">
        <div class="section-header">
          <h2>Consumo de tokens</h2>
          <p>Los tokens se exportan en formato W3C Design Tokens y se traducen automáticamente a diferentes formatos según la plataforma objetivo. Este proceso de transformación permite que un mismo conjunto de tokens alimente múltiples sistemas sin duplicación de esfuerzo.</p>
          <p>El flujo típico comienza con archivos JSON en formato W3C que contienen todos los tokens del sistema. Estas definiciones pasan por herramientas de transformación (como Style Dictionary o herramientas personalizadas) que generan salidas específicas para cada plataforma: CSS variables para web, recursos nativos para iOS y Android, o props para frameworks como React, Angular o Blazor.</p>
          <p>Esta arquitectura garantiza que un cambio en los tokens se refleje automáticamente en todas las plataformas, manteniendo la coherencia visual y reduciendo el tiempo de desarrollo. Además, permite que diferentes equipos trabajen con los formatos que mejor conocen, mientras comparten la misma fuente de verdad.</p>
        </div>

        <div class="consumption-example">
          <div class="consumption-step">
            <h4>1. Tokens W3C</h4>
            <p class="step-description">Formato estándar que contiene todas las definiciones de tokens con su estructura jerárquica, tipos y valores.</p>
            <div style="position: relative;">
              <button class="copy-btn" onclick="copySnippet('raw-consumption-1')">Copy</button>
              <pre class="code-block"><code class="playground-code-content">${highlightHtml(consumptionCode1)}</code></pre>
              <div id="raw-consumption-1" style="display:none">${consumptionCode1}</div>
            </div>
          </div>
          <div class="consumption-arrow">↓ transformación</div>
          <div class="consumption-step">
            <h4>2. CSS Variables</h4>
            <p class="step-description">Variables CSS generadas automáticamente que pueden usarse directamente en estilos o componentes web.</p>
            <div style="position: relative;">
              <button class="copy-btn" onclick="copySnippet('raw-consumption-2')">Copy</button>
              <pre class="code-block"><code class="playground-code-content">${highlightHtml(consumptionCode2)}</code></pre>
              <div id="raw-consumption-2" style="display:none">${consumptionCode2}</div>
            </div>
          </div>
        </div>
        <p class="hint-text">El mismo proceso se aplica para otras plataformas: iOS recibe archivos de recursos nativos, Android archivos XML de recursos, y los frameworks reciben módulos JavaScript/TypeScript con los valores exportados. Todo desde la misma fuente de verdad.</p>
      </section>

      <section class="overview-section">
        <div class="section-header">
          <h2>Temas y modos</h2>
          <p>Los design tokens permiten crear múltiples temas y modos sin duplicar componentes o código. Un tema es una variación completa del sistema de diseño (por ejemplo, light mode vs. dark mode), mientras que un modo puede ser una variante específica dentro de un tema (como high contrast).</p>
          <p>En KDS-AI, los temas se implementan mediante diferentes conjuntos de tokens que comparten la misma estructura pero tienen valores diferentes. Por ejemplo, el token <code>semantic.colors.surface.primary</code> puede tener el valor <code>#FFFFFF</code> en light mode y <code>#1A1A1A</code> en dark mode, pero los componentes que lo usan no necesitan cambiar.</p>
          <p>Esta arquitectura permite que los usuarios cambien entre temas sin recargar la página, que diferentes marcas usen el mismo conjunto de componentes con diferentes tokens, y que se creen variantes experimentales o estacionales del sistema sin afectar la implementación base.</p>
        </div>

        <div class="theme-example">
          <div class="theme-comparison">
            <div class="theme-card">
              <div class="theme-label">Light Mode</div>
              <div class="theme-preview" style="background: #FFFFFF; border: 1px solid #E8ECF4;">
                <div style="padding: 1rem;">
                  <div style="background: #1484FF; color: #FFF; padding: 0.5rem 1rem; border-radius: 6px; display: inline-block; margin-bottom: 0.5rem;">Button</div>
                  <p style="color: #1A1F2F; margin: 0;">Texto en light mode</p>
                </div>
              </div>
              <code class="theme-code">semantic.colors.surface.primary: #FFFFFF</code>
            </div>
            <div class="theme-card">
              <div class="theme-label">Dark Mode</div>
              <div class="theme-preview" style="background: #1A1A1A; border: 1px solid #3C3C3C;">
                <div style="padding: 1rem;">
                  <div style="background: #1484FF; color: #FFF; padding: 0.5rem 1rem; border-radius: 6px; display: inline-block; margin-bottom: 0.5rem;">Button</div>
                  <p style="color: #E6E6E6; margin: 0;">Texto en dark mode</p>
                </div>
              </div>
              <code class="theme-code">semantic.colors.surface.primary: #1A1A1A</code>
            </div>
          </div>
        </div>
        <p class="hint-text">El mismo componente, los mismos tokens, diferentes valores. Los tokens semánticos permiten que los componentes se adapten automáticamente al tema activo sin necesidad de lógica condicional en el código del componente.</p>
      </section>

      <section class="overview-section">
        <div class="section-header">
          <h2>${t('overview.governance.title')}</h2>
          <p>${t('overview.governance.intro')}</p>
        </div>
        
        <div class="governance-grid">
          <div class="governance-item">
            <h4>${t('overview.governance.whoModifies')}</h4>
            <p>${t('overview.governance.designers')}</p>
            <p>${t('overview.governance.developers')}</p>
          </div>
          <div class="governance-item">
            <h4>${t('overview.governance.changeProcess')}</h4>
            <p>${t('overview.governance.changeSteps')}</p>
          </div>
          <div class="governance-item">
            <h4>${t('overview.governance.validation')}</h4>
            <p>${t('overview.governance.validationItems')}</p>
          </div>
        </div>
      </section>

      <section class="overview-section alt-bg">
        <div class="section-header">
          <h2>Buenas prácticas</h2>
          <p>Siguiendo estas prácticas, puedes maximizar los beneficios de los design tokens y crear sistemas más mantenibles, escalables y coherentes.</p>
        </div>

        <div class="practices-list">
          <div class="practice-item">
            <h4>Naming consistente</h4>
            <p>Usa la estructura <code>category.role.state.scale</code> para nombrar tokens de forma predecible y comprensible. Esta convención facilita la navegación del sistema y reduce la curva de aprendizaje.</p>
            <p>Ejemplos: <code>primitive.colors.base.blue</code> (categoría: colors, rol: base, estado: n/a, escala: blue), <code>semantic.colors.text.primary.default</code> (categoría: colors, rol: text, estado: primary, escala: default).</p>
            <p>Evita abreviaciones crípticas y nombres genéricos como "color1" o "spacing-large". Los nombres deben ser autodocumentados y expresar claramente el propósito del token.</p>
          </div>
          <div class="practice-item">
            <h4>Alias sobre literales</h4>
            <p>Prioriza referencias a otros tokens sobre valores literales siempre que sea posible. Los alias habilitan theming, crean relaciones semánticas claras y facilitan cambios globales.</p>
            <p>Un token semántico como <code>semantic.colors.primary</code> debe referenciar un primitivo como <code>{primitive.colors.base.blue}</code> en lugar de contener directamente el valor hexadecimal. Esto permite cambiar el color primario del sistema modificando solo la referencia, sin tocar los componentes.</p>
            <p>Los únicos casos donde los literales son apropiados son valores de sistema (como 1px para hairlines) o valores que no tienen significado semántico reutilizable.</p>
          </div>
          <div class="practice-item">
            <h4>Evita referencias circulares</h4>
            <p>No crees referencias circulares donde un token A referencia a B, y B referencia de vuelta a A (directa o indirectamente). Estas cadenas circulares hacen imposible la resolución de valores y causan errores en las herramientas.</p>
            <p>Documenta las cadenas de alias para claridad. Si un token tiene una cadena de referencias profunda (más de 3-4 niveles), considera si la estructura puede simplificarse. Las cadenas muy largas pueden ser difíciles de seguir y mantener.</p>
            <p>Usa herramientas de validación que detecten referencias circulares automáticamente antes de que causen problemas en producción.</p>
          </div>
          <div class="practice-item">
            <h4>Versionado y cambios incrementales</h4>
            <p>Realiza cambios pequeños y frecuentes en lugar de grandes refactorizaciones. Esto facilita la revisión, reduce el riesgo de errores y permite rollback más fácil si es necesario.</p>
            <p>Incluye visual diffs en cada PR para que los revisores puedan ver el impacto visual de los cambios. Esto es especialmente importante para cambios en tokens de color o tipografía que pueden tener efectos visuales significativos.</p>
            <p>Implementa validación automática que verifique contrastes, tipos correctos y ausencia de referencias circulares. Esta validación debe ejecutarse en CI/CD para prevenir la introducción de tokens inválidos.</p>
          </div>
          <div class="practice-item">
            <h4>Documentación y descripciones</h4>
            <p>Usa la propiedad <code>$description</code> para documentar el propósito y uso de cada token. Las descripciones ayudan a otros miembros del equipo a entender cuándo y cómo usar cada token.</p>
            <p>Las descripciones deben explicar el contexto de uso, las relaciones con otros tokens, y cualquier consideración especial (como accesibilidad o theming). Esta documentación es especialmente valiosa para tokens semánticos que pueden tener múltiples usos.</p>
          </div>
          <div class="practice-item">
            <h4>Organización y agrupación</h4>
            <p>Agrupa tokens relacionados usando la estructura jerárquica del formato W3C. Los grupos facilitan la navegación y el mantenimiento, especialmente en sistemas grandes con cientos o miles de tokens.</p>
            <p>Mantén una estructura plana en los niveles primitivos (para facilitar la búsqueda) y usa anidación más profunda en niveles semánticos y de componentes (donde la organización por contexto es más valiosa).</p>
          </div>
        </div>
      </section>
    </main>
  `;
};

// scroll to specific token anchor after render (for cross-scope alias links)
const scrollToHashToken = () => {
    const hash = window.location.hash.slice(1);
    const parts = hash.split('/');
    if (parts.length >= 3) {
        const tokenId = parts[2];
        setTimeout(() => {
            const el = document.getElementById(`w3c-token-${tokenId}`);
            if (el) {
              el.classList.add('token-highlight');
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              setTimeout(() => el.classList.remove('token-highlight'), 1200);
            }
        }, 50);
    }
};

const render = async () => {
  const hash = window.location.hash.slice(1) || 'tokensW3C/Primitives';
  app.innerHTML = renderNav(hash);

  if (hash === 'tokensOverview') {
      app.innerHTML += renderTokensOverview();
  } else if (hash.startsWith('tokensW3C/') || hash.startsWith('tokens/')) {
      app.innerHTML += `<main><p>Loading W3C tokens...</p></main>`;
      const scope = hash.split('/')[1];
      const view = await renderTokensW3CView(scope);
      app.innerHTML = renderNav(hash) + view;
      scrollToHashToken(); // ensure scroll even when same-page hash
  } else {
      app.innerHTML += renderComponent(hash);
      const component = data.components.find(c => c.tag === hash);
      if (component) renderPlaygroundPreview(component);
  }
  ensureBackToTopButton();
};

// helper to copy values
(window as any).copyTokenValue = (valEnc: string, btn: HTMLElement) => {
  const value = decodeURIComponent(valEnc || '');
  navigator.clipboard.writeText(value).then(() => {
    if (btn) {
      const original = btn.textContent;
      btn.textContent = '✓';
      setTimeout(() => { btn.textContent = original || '⧉'; }, 1200);
    }
  });
};

// helper to scroll to token anchor
(window as any).scrollToToken = (tokenId: string) => {
  const el = document.getElementById(`w3c-token-${tokenId}`);
  if (el) {
    el.classList.add('token-highlight');
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => el.classList.remove('token-highlight'), 1200);
  }
};

// language switcher
(window as any).switchLang = (lang: 'es' | 'en') => {
  setLang(lang);
  render(); // re-render with new language
};

// Listen for language changes
onLangChange(() => {
  render();
});

window.addEventListener('hashchange', render);
window.addEventListener('hashchange', scrollToHashToken);
render();
scrollToHashToken();
