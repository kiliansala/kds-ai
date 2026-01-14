import './style.css'
import './styles/tokens.css'
import './components/kds-button'
import contractData from '../contracts/component-definitions.json'
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
    const aliasChains = (tokensData as any).aliasChains || {};
    const precomputed = aliasChains[variable.cssName];
    if (precomputed && precomputed.length) {
        const resolvedValue = resolveValueRecursive(variable, modeId);
        const seen = new Set<string>();
        const visibleChain = precomputed.filter((entry: any) => {
            const key = `${entry.name}|${entry.path}|${entry.level}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        const chainHtml = visibleChain.length ? visibleChain.map((entry: any, idx: number) => {
            const name = entry.name || '';
            const path = entry.path || '';
            return `→ ${name} ${path ? `(${path})` : ''}<br><small style="color:#999;">${(entry.level || '').toLowerCase()}</small>${idx === visibleChain.length - 1 ? '' : '<br>'}`;
        }).join('<br>') : '—';
        return { chainHtml, resolvedValue, targetLevel: precomputed[precomputed.length - 1].level, targetVar: null };
    }

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
    const target = chain[chain.length - 1]?.variable;
    const targetLevel = chain[chain.length - 1]?.level || getVariableLevel(variable);

    const seen = new Set<string>();
    const visibleChain = chain.filter((entry) => {
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

    return { chainHtml, resolvedValue, targetLevel, targetVar: target };
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
  return `
    <nav>
      <h3>KDS AI v${data.version}</h3>
      
      <div class="nav-section">
        <h4 style="margin: 1rem 0 0.5rem; color: #999; font-size: 0.75em; text-transform: uppercase;">Design Tokens</h4>
        <ul>
          <li><a href="#tokens/Primitives" style="text-decoration:none;" class="nav-link ${selected === 'tokens/Primitives' ? 'active' : ''}">Primitives</a></li>
          <li><a href="#tokens/Semantic" style="text-decoration:none;" class="nav-link ${selected === 'tokens/Semantic' ? 'active' : ''}">Semantic</a></li>
          <li><a href="#tokens/Components" style="text-decoration:none;" class="nav-link ${selected === 'tokens/Components' ? 'active' : ''}">Components</a></li>
        </ul>
      </div>

      <div class="nav-section">
        <h4 style="margin: 1.5rem 0 0.5rem; color: #999; font-size: 0.75em; text-transform: uppercase;">Components</h4>
        <ul>
          ${data.components.map(c => `
            <li><a href="#${c.tag}" style="text-decoration:none;" class="nav-link ${selected === c.tag ? 'active' : ''}">${c.name}</a></li>
          `).join('')}
        </ul>
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
    const canonical = getCanonicalVarByCss(variable.cssName || '');
    const cssCanonical = canonical?.css || normalizeCss(variable.cssName || '');
    const isColor = variable.resolvedType === 'COLOR';
    const modeCells = coll.modes.map((m: any) => {
        const { chainHtml, resolvedValue } = resolveAliasChainForMode(variable, m.modeId);
        const swatch = isColor ? `<div style="flex-shrink:0; width:18px; height:18px; background:${resolvedValue}; border:1px solid #ddd; border-radius:4px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);"></div>` : '';
        return `
            <td style="vertical-align: top; padding: 12px;">
                <div style="font-size: 0.85em; color:#555; line-height:1.4;">${chainHtml}</div>
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
            <td style="vertical-align: top; padding: 12px;"><code style="font-size: 0.8em; color: #d63384;">${cssCanonical}</code></td>
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

const render = () => {
  const hash = window.location.hash.slice(1) || 'tokens/Primitives';
  app.innerHTML = renderNav(hash);
  
  if (hash.startsWith('tokens/')) {
      app.innerHTML += renderTokensView(hash.split('/')[1]);
  } else {
      app.innerHTML += renderComponent(hash);
      const component = data.components.find(c => c.tag === hash);
      if (component) renderPlaygroundPreview(component);
  }
  ensureBackToTopButton();
};

window.addEventListener('hashchange', render);
render();
