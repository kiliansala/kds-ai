import './style.css'
import './styles/tokens.css'
import './components/kds-button'
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

function getCssVarName(variable: any, collection: any): string {
    if (!variable || !collection) return '--kds-unknown';
    
    // Prefer pre-resolved name from the sync process if available
    if (variable.cssName) return variable.cssName;

    const normalizedName = variable.name.toLowerCase().replace(/[\/\s]/g, '-');
    const collectionName = collection.name.toLowerCase();
    
    let cssName = '';
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

    if (normalizedName === 'primary') cssName = '--kds-sys-color-primary';
    if (normalizedName === 'on-primary') cssName = '--kds-sys-color-on-primary';
    if (normalizedName === 'secondary-container') cssName = '--kds-sys-color-secondary-container';
    if (normalizedName === 'on-secondary-container') cssName = '--kds-comp-on-secondary-container';
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

    return cssName;
};

const resolveValue = (variable: any, modeId: string, allVars: any): any => {
    const valObj = variable.valuesByMode[modeId] || Object.values(variable.valuesByMode)[0];
    if (valObj && typeof valObj === 'object' && valObj.type === 'VARIABLE_ALIAS') {
        const sid = getShortId(valObj.id);
        const aliased = allVars[sid];
        if (aliased) return resolveValue(aliased, modeId, allVars);
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
    return valObj;
};

const renderNav = (selected: string) => {
  return `
    <nav>
      <h3>KDS AI v${data.version}</h3>
      
      <div class="nav-section">
        <h4 style="margin: 1rem 0 0.5rem; color: #999; font-size: 0.75em; text-transform: uppercase;">Design Tokens</h4>
        <ul>
          <li><a href="#tokens/Primitives" class="nav-link ${selected === 'tokens/Primitives' ? 'active' : ''}">Primitives</a></li>
          <li><a href="#tokens/Semantic" class="nav-link ${selected === 'tokens/Semantic' ? 'active' : ''}">Semantic</a></li>
          <li><a href="#tokens/Components" class="nav-link ${selected === 'tokens/Components' ? 'active' : ''}">Components</a></li>
        </ul>
      </div>

      <div class="nav-section">
        <h4 style="margin: 1.5rem 0 0.5rem; color: #999; font-size: 0.75em; text-transform: uppercase;">Components</h4>
        <ul>
          ${data.components.map(c => `
            <li><a href="#${c.tag}" class="nav-link ${selected === c.tag ? 'active' : ''}">${c.name}</a></li>
          `).join('')}
        </ul>
      </div>
    </nav>
  `
};

const renderTokensView = (level: string) => {
    const levelData = (tokensData as any)[level];
    if (!levelData) return `<main><h1>Tokens not found</h1></main>`;

    // Sort collections by priority
    const collections = Object.values(levelData.collections)
        .filter((c: any) => !c.remote)
        .sort((a: any, b: any) => {
            let indexA = COLLECTION_PRIORITY.indexOf(a.name);
            let indexB = COLLECTION_PRIORITY.indexOf(b.name);
            if (indexA === -1) indexA = 99;
            if (indexB === -1) indexB = 99;
            return indexA - indexB;
        });

    let html = `<main>
        <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 2rem;">
            <h1>${level} Tokens</h1>
            <span style="color: #999; font-size: 0.8em; font-weight: 600;">SINGLE SOURCE OF TRUTH: FIGMA</span>
        </div>`;

    if (collections.length > 1) {
        html += `<div style="display: grid; grid-template-columns: 200px 1fr; gap: 3rem;">
            <aside style="position: sticky; top: 2rem; height: fit-content;">
                <h5 style="margin: 0 0 1rem; color: #666; font-size: 0.8em; text-transform: uppercase;">Collections</h5>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${collections.map((c: any) => `
                        <li style="margin-bottom: 0.5rem;">
                            <a href="javascript:void(0)" onclick="document.getElementById('coll-${c.name}').scrollIntoView({behavior:'smooth'})" style="color: #0066cc; text-decoration: none; font-size: 0.85em; display: block; padding: 4px 8px; border-radius: 4px;">${c.name}</a>
                        </li>
                    `).join('')}
                </ul>
            </aside>
            <section>`;
    } else {
        html += `<section>`;
    }

    collections.forEach((coll: any) => {
        const isTypography = coll.name.toLowerCase().includes('typography') || coll.name.toLowerCase().includes('typescale');
        
        html += `<h2 id="coll-${coll.name}" style="background: #f8f9fa; padding: 0.75rem 1rem; border-radius: 6px; border-left: 5px solid #1484ff; margin: 0 0 1.5rem 0; font-size: 1.25em;">${coll.name}</h2>`;
        
        if (isTypography) {
            const collVars = coll.variableIds.map((id: string) => (tokensData as any).allVariables[getShortId(id)]).filter(Boolean);
            const typoGroups: any = {};
            collVars.forEach((v: any) => {
                const parts = v.name.split('/');
                const styleName = parts.slice(0, -1).join(' ') || 'General';
                const propName = parts.pop();
                if (!typoGroups[styleName]) typoGroups[styleName] = {};
                typoGroups[styleName][propName] = v;
            });

            for (const styleName in typoGroups) {
                const props = typoGroups[styleName];
                const defMode = coll.modes[0].modeId;
                
                const fontVar = props['Font'] ? getCssVarName(props['Font'], coll) : 'inherit';
                const weightVar = props['Weight'] ? getCssVarName(props['Weight'], coll) : 'inherit';
                const sizeVar = props['Size'] ? getCssVarName(props['Size'], coll) : 'inherit';
                const lhVar = props['Line Height'] ? getCssVarName(props['Line Height'], coll) : 'normal';
                const trackVar = props['Tracking'] ? getCssVarName(props['Tracking'], coll) : 'normal';

                html += `<div style="margin-bottom: 3rem;">
                    <h3 style="font-size: 1em; color: #444; border: none; margin-bottom: 0.5rem;">${styleName}</h3>
                    <div style="padding: 24px; border: 1px solid #eee; border-radius: 8px; margin-bottom: 1rem; background: #fff;
                         font-family: var(${fontVar}, inherit);
                         font-weight: var(${weightVar}, inherit);
                         font-size: var(${sizeVar}, inherit);
                         line-height: var(${lhVar}, normal);
                         letter-spacing: var(${trackVar}, normal);">
                        ${styleName} - The quick brown fox jumps over the lazy dog
                    </div>
                    <table class="api-table">
                        <thead>
                            <tr><th>Property</th><th>Token</th><th>Value</th></tr>
                        </thead>
                        <tbody>
                            ${Object.keys(props).map(p => `
                                <tr>
                                    <td>${p}</td>
                                    <td><code>${getCssVarName(props[p], coll)}</code></td>
                                    <td><code>${resolveValue(props[p], defMode, (tokensData as any).allVariables)}</code></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>`;
            }
        } else {
            html += `
                <table class="api-table" style="margin-bottom: 4rem; width: 100%;">
                    <thead>
                        <tr>
                            <th style="width: 280px; background: #fafafa;">Token Name</th>
                            ${coll.modes.map((m: any) => `<th style="background: #fafafa;">${m.name}</th>`).join('')}
                            <th style="background: #fafafa;">CSS Variable</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${coll.variableIds.map((vid: string) => {
                            const variable = (tokensData as any).allVariables[getShortId(vid)];
                            if (!variable) return '';
                            const cssName = getCssVarName(variable, coll);
                            const isColor = variable.resolvedType === 'COLOR';
                            
                            return `
                                <tr>
                                    <td style="vertical-align: top; padding: 12px;">
                                        <strong>${variable.name.split('/').pop()}</strong><br>
                                        <small style="color:#999; font-family: monospace; font-size: 0.8em;">${variable.name}</small>
                                    </td>
                                    ${coll.modes.map((m: any) => {
                                        const val = resolveValue(variable, m.modeId, (tokensData as any).allVariables);
                                        return `
                                            <td style="vertical-align: top; padding: 12px;">
                                                ${isColor ? `
                                                    <div style="display:flex; align-items:center; gap:8px;">
                                                        <div style="flex-shrink:0; width:18px; height:18px; background:${val}; border:1px solid #ddd; border-radius:4px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);"></div>
                                                        <code>${val}</code>
                                                    </div>` : `<code style="color: #444;">${val}</code>`}
                                            </td>
                                        `;
                                    }).join('')}
                                    <td style="vertical-align: top; padding: 12px;"><code style="font-size: 0.8em; color: #d63384;">${cssName}</code></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }
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
                // Find the variable in tokensData.allVariables
                const cssTarget = tName.startsWith('--') ? tName : `--${tName}`;
                let foundVar: any = null;
                let foundColl: any = null;

                // Simple search over all variables to find the one that generates this CSS name
                for (const level of ['Primitives', 'Semantic', 'Components']) {
                    const levelData = (tokensData as any)[level];
                    if (!levelData) continue;
                    for (const coll of Object.values(levelData.collections) as any[]) {
                        for (const vid of coll.variableIds) {
                            const v = (tokensData as any).allVariables[getShortId(vid)];
                            if (v && getCssVarName(v, coll) === cssTarget) {
                                foundVar = v;
                                foundColl = coll;
                                break;
                            }
                        }
                        if (foundVar) break;
                    }
                    if (foundVar) break;
                }

                if (!foundVar) return `<tr><td><code>${tName}</code></td><td colspan="2"><em>Value not found in sync</em></td><td><code>${cssTarget}</code></td></tr>`;

                const isColor = foundVar.resolvedType === 'COLOR';
                return `
                    <tr>
                        <td><strong>${foundVar.name.split('/').pop()}</strong></td>
                        ${foundColl.modes.map((m: any) => {
                            const val = resolveValue(foundVar, m.modeId, (tokensData as any).allVariables);
                            return `<td>${isColor ? `<div style="display:flex; align-items:center; gap:6px;"><div style="width:14px; height:14px; background:${val}; border:1px solid #ddd; border-radius:2px;"></div><code>${val}</code></div>` : `<code>${val}</code>`}</td>`;
                        }).join('')}
                        <td><code>${cssTarget}</code></td>
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
};

window.addEventListener('hashchange', render);
render();
