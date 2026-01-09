import './style.css'
import './components/kds-button'
// @ts-ignore
import contractData from '../contracts/component-definitions.json'

interface Contract {
  version: string;
  components: any[];
}

const data = contractData as Contract;

const app = document.querySelector<HTMLDivElement>('#app')!;

const renderNav = () => {
  return `
    <nav>
      <h3>KDS AI v${data.version}</h3>
      <ul>
        ${data.components.map(c => `
          <li><a href="#${c.tag}" class="nav-link" data-tag="${c.tag}">${c.name}</a></li>
        `).join('')}
      </ul>
    </nav>
  `
};

const renderPropTable = (props: any[]) => {
  if (!props || props.length === 0) return '<p>No properties.</p>';
  return `
    <table class="api-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
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

const renderEventTable = (events: any[]) => {
  if (!events || events.length === 0) return '<p>No custom events.</p>';
  return `
    <table class="api-table">
      <thead>
        <tr>
          <th>Event</th>
          <th>Description</th>
          <th>Payload</th>
        </tr>
      </thead>
      <tbody>
        ${events.map((e: any) => `
          <tr>
            <td><code>${e.name}</code></td>
            <td>${e.description || ''}</td>
            <td><code>${e.payloadType || 'Event'}</code></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
};

const state: Record<string, any> = {};

const renderControl = (prop: any, value: any, tagName: string) => {
  const handler = `window.updateState('${tagName}', '${prop.name}', this.value, '${prop.type}')`;
  
  if (prop.type === 'enum') {
    return `
      <div class="control-group">
        <label>${prop.name}</label>
        <select onchange="${handler}">
          ${prop.allowedValues?.map((v: string) => `
            <option value="${v}" ${v === value ? 'selected' : ''}>${v}</option>
          `).join('')}
        </select>
      </div>
    `;
  }
  
  if (prop.type === 'boolean') {
    const boolHandler = `window.updateState('${tagName}', '${prop.name}', this.checked, '${prop.type}')`;
    return `
      <div class="control-group">
        <label>${prop.name}</label>
        <input type="checkbox" ${value ? 'checked' : ''} onchange="${boolHandler}">
      </div>
    `;
  }

  return `
    <div class="control-group">
      <label>${prop.name}</label>
      <input type="text" value="${value || ''}" oninput="${handler}">
    </div>
  `;
};

const renderPlayground = (component: any) => {
  // Initialize state if needed
  if (!state[component.tag]) {
    state[component.tag] = {};
    component.properties.forEach((p: any) => {
      state[component.tag][p.name] = p.default;
    });
  }

  const currentProps = state[component.tag];
  
  // Build attribute string
  const attributes = Object.entries(currentProps)
    .map(([key, val]) => {
        if (val === false) return '';
        if (val === true) return ` ${key}`;
        if (val === '' || val === null || val === undefined) return '';
        return ` ${key}="${val}"`;
    })
    .join('');

  const tagString = `<${component.tag}${attributes}></${component.tag}>`;

  return `
    <div class="playground">
      <div class="playground-preview">
        <!-- In Phase 4, the real component will be here -->
        <span style="color: #666; font-style: italic;">Preview:</span> &nbsp; <code>${tagString}</code>
      </div>
      
      <div class="playground-code">
        ${tagString.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </div>

      <div class="playground-controls">
        ${component.properties.map((p: any) => 
          renderControl(p, currentProps[p.name], component.tag)
        ).join('')}
      </div>
    </div>
  `;
};

const renderComponent = (tag: string) => {
  const component = data.components.find(c => c.tag === tag);
  if (!component) return `<main><h1>Component not found</h1></main>`;

  return `
    <main>
      <h1>${component.name}</h1>
      <p>${component.description}</p>
      
      <h2>Interactive Playground</h2>
      ${renderPlayground(component)}

      <h2>Properties</h2>
      ${renderPropTable(component.properties)}

      <h2>Events</h2>
      ${renderEventTable(component.events)}
      
      <h2>Slots</h2>
      ${renderPropTable(component.slots.map((s: any) => ({...s, type: 'slot', default: undefined})))}
    </main>
  `;
};

// Global state updater
(window as any).updateState = (tag: string, prop: string, value: any, type: string) => {
  if (type === 'boolean') {
      state[tag][prop] = value; // Checkbox passes boolean directly
  } else {
      state[tag][prop] = value;
  }
  render();
};

const render = () => {
  const hash = window.location.hash.slice(1);
  const selectedTag = hash || data.components[0].tag;

  app.innerHTML = `
    ${renderNav()}
    ${renderComponent(selectedTag)}
  `;

  // Update active state
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-tag') === selectedTag);
  });
};

window.addEventListener('hashchange', render);
render();
