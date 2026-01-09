/**
 * KdsButton
 * Contract-compliant implementation of the Button component.
 * 
 * Properties:
 * - label: string
 * - variant: primary | secondary | tertiary | danger
 * - size: sm | md | lg
 * - icon: string
 * - iconPosition: start | end
 * - type: button | submit | reset
 * - disabled: boolean
 * - loading: boolean
 * - href: string
 */
export class KdsButton extends HTMLElement {
  static get observedAttributes() {
    return [
      'variant', 'size', 'icon', 'icon-position', 'type', 
      'disabled', 'loading', 'href', 'label'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  // Props getters/setters reflecting attributes
  get variant() { return this.getAttribute('variant') || 'primary'; }
  set variant(val) { this.setAttribute('variant', val); }

  get size() { return this.getAttribute('size') || 'md'; }
  set size(val) { this.setAttribute('size', val); }

  get type() { return this.getAttribute('type') || 'button'; }
  set type(val) { this.setAttribute('type', val); }

  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(val) { val ? this.setAttribute('disabled', '') : this.removeAttribute('disabled'); }

  get loading() { return this.hasAttribute('loading'); }
  set loading(val) { val ? this.setAttribute('loading', '') : this.removeAttribute('loading'); }

  get href() { return this.getAttribute('href'); }
  set href(val) { val ? this.setAttribute('href', val) : this.removeAttribute('href');  }

  get label() { return this.getAttribute('label') || ''; }
  
  private setupEventListeners() {
    this.shadowRoot?.addEventListener('click', (e) => {
      if (this.disabled || this.loading) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      this.dispatchEvent(new CustomEvent('kds-click', {
        bubbles: true,
        composed: true,
        detail: { originalEvent: e }
      }));
    });
  }

  render() {
    if (!this.shadowRoot) return;

    const variant = this.variant;
    const size = this.size;
    const disabled = this.disabled;
    const loading = this.loading;
    const href = this.href;
    const label = this.label;

    // Basic styling for the button (in-component for now to be self-contained as requested by "HTML/JS + CSS")
    // In a real system, we'd use Constructable Stylesheets with token imports.
    const style = `
      <style>
        :host {
          display: inline-block;
          font-family: var(--kds-font-family, sans-serif);
        }
        .kds-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid transparent;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          gap: 0.5rem;
          border-radius: 4px;
          text-decoration: none;
          box-sizing: border-box;
          line-height: normal;
        }
        
        /* Sizes */
        .kds-btn--sm { font-size: 0.875rem; padding: 0.25rem 0.5rem; height: 28px; }
        .kds-btn--md { font-size: 1rem; padding: 0.5rem 1rem; height: 40px; }
        .kds-btn--lg { font-size: 1.125rem; padding: 0.75rem 1.5rem; height: 56px; }

        /* Variants */
        .kds-btn--primary {
          background-color: #646cff;
          color: white;
        }
        .kds-btn--primary:hover { background-color: #535bf2; }

        .kds-btn--secondary {
          background-color: transparent;
          border-color: #646cff;
          color: #646cff;
        }

        .kds-btn--tertiary {
            background-color: transparent;
            color: #ccc;
        }

        .kds-btn--danger {
            background-color: #ff4d4f;
            color: white;
        }

        /* States */
        .kds-btn:disabled, .kds-btn--disabled {
          opacity: 0.5;
          cursor: not-allowed;
          filter: grayscale(100%);
        }
        
        .kds-btn--loading {
           cursor: wait;
        }
      </style>
    `;

    const tag = href ? 'a' : 'button';
    const typeAttr = href ? '' : `type="${this.type}"`;
    const hrefAttr = href ? `href="${href}"` : '';
    const disabledAttr = disabled ? 'disabled' : '';
    const classes = [
      'kds-btn',
      `kds-btn--${variant}`,
      `kds-btn--${size}`,
      disabled ? 'kds-btn--disabled' : '',
      loading ? 'kds-btn--loading' : ''
    ].join(' ');

    const content = loading ? 'Loading...' : `<slot>${label}</slot>`;

    this.shadowRoot.innerHTML = `
      ${style}
      <${tag} class="${classes}" ${typeAttr} ${hrefAttr} ${disabledAttr}>
        ${content}
      </${tag}>
    `;
  }
}

customElements.define('kds-button', KdsButton);
