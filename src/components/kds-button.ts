/**
 * KdsButton
 * Contract-compliant implementation of the Button component.
 * 
 * Properties (Strict Figma Match):
 * - appearance: filled | outlined | text | elevated | tonal
 * - disabled: boolean (Figma State)
 * - hasIcon: boolean (Figma Show Icon)
 * - label: string (Figma Text Content)
 * - icon: string (Figma Icon Instance Name)
 */
export class KdsButton extends HTMLElement {
  static get observedAttributes() {
    return [
      'appearance', 'state', 'has-icon', 'label', 'icon'
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

  // Props
  get appearance() { return this.getAttribute('appearance') || 'filled'; }
  set appearance(val) { this.setAttribute('appearance', val); }

  // State handles the enabled/disabled status matching Figma
  get state() { return this.getAttribute('state') || 'enabled'; }
  set state(val) { this.setAttribute('state', val); }

  // Derived disabled property for internal logic
  get disabled() { return this.state === 'disabled'; }

  get hasIcon() { return this.hasAttribute('has-icon') && this.getAttribute('has-icon') !== 'false'; }
  set hasIcon(val) { val ? this.setAttribute('has-icon', '') : this.removeAttribute('has-icon'); }

  get label() { return this.getAttribute('label') || ''; }
  
  get icon() { return this.getAttribute('icon') || 'add'; }
  set icon(val) { this.setAttribute('icon', val); }

  // Functional props (Internal use)
  get type() { return this.getAttribute('type') || 'button'; }
  get href() { return this.getAttribute('href'); }
  
  private setupEventListeners() {
    this.shadowRoot?.addEventListener('click', (e) => {
      // Prevent click if state is disabled
      if (this.disabled) {
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

    const appearance = this.appearance;
    const disabled = this.disabled; // Derived from state
    const hasIcon = this.hasIcon;
    const label = this.label;
    const iconName = this.icon;
    const href = this.href;

    // Use default 'md' size styles hardcoded since 'size' prop is removed from Figma
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
          font-weight: var(--kds-typography-label-large-weight, 500);
          font-size: var(--kds-typography-label-large-size, 14px);
          line-height: var(--kds-typography-label-large-line-height, 20px);
          letter-spacing: var(--kds-typography-label-large-tracking, 0.1px);
          transition: all 0.2s;
          gap: 0.5rem;
          border-radius: 100px; 
          text-decoration: none;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
          
          /* Default Size (MD) */
          height: 40px; 
          padding: 0 24px;
        }

        /* Adjustment for icon padding */
        .kds-btn--has-icon {
            padding-left: 16px;
        }
        
        /* Styles */
        .kds-btn--filled {
          background-color: var(--kds-comp-primary);
          color: var(--kds-comp-on-primary);
        }
        
        /* Interaction Layer (Figma State mapping) */
        .kds-btn::after {
            content: "";
            position: absolute;
            inset: 0;
            background-color: currentColor;
            opacity: 0;
            transition: opacity 0.2s;
            pointer-events: none;
        }

        .kds-btn:hover::after,
        .kds-btn--hovered::after {
            opacity: var(--kds-comp-primary-opacity-08, 0.08);
        }
        
        .kds-btn:focus-visible::after,
        .kds-btn--focused::after {
            opacity: var(--kds-comp-primary-opacity-12, 0.12);
        }

        .kds-btn:active::after,
        .kds-btn--pressed::after {
            opacity: var(--kds-comp-primary-opacity-16, 0.16);
        }

        .kds-btn--filled:hover,
        .kds-btn--filled.kds-btn--hovered {
          box-shadow: 0 1px 3px 1px rgba(0,0,0,0.15); 
        }

        .kds-btn--outlined {
          background-color: transparent;
          border-color: var(--kds-comp-outline); 
          color: var(--kds-comp-primary);
          border-width: 1px;
        }
        
        .kds-btn--text {
            background-color: transparent;
            color: var(--kds-comp-primary);
            padding: 0 12px;
        }
        
        .kds-btn--tonal {
            background-color: var(--kds-comp-secondary-container);
            color: var(--kds-comp-on-secondary-container);
        }
        
        .kds-btn--elevated {
            background-color: var(--kds-comp-surface-container-low);
            color: var(--kds-comp-primary);
            box-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        /* States (Disabled) */
        .kds-btn--disabled {
          background-color: var(--kds-comp-surface-container-low);
          color: var(--kds-comp-on-surface-variant);
          cursor: not-allowed;
          box-shadow: none !important;
          pointer-events: none;
          border-color: transparent;
        }

        /* Icon Stub - Now using Real Material Symbols */
        .material-symbols-outlined {
            font-size: 18px;
            line-height: 1;
            /* Font family is loaded globally in index.html, but we need to ensure it applies in Shadow DOM.
               The best way in Shadow DOM is to import it or assume inheritance if variables are used, 
               but for font-face it's tricky. 
               For this prototype, we'll try to rely on the fact that Google Fonts usually injects @font-face 
               accessible. If not, we might need a @import in this style block.
            */
        }
      </style>
      <!-- We need to import the font style inside Shadow DOM or use a constructed stylesheet -->
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
    `;

    const disabledAttr = disabled ? 'disabled' : '';
    const classes = [
      'kds-btn',
      `kds-btn--${appearance}`,
      `kds-btn--${this.state}`,
      hasIcon ? 'kds-btn--has-icon' : ''
    ].join(' ');
    
    const tag = href ? 'a' : 'button';
    const typeAttr = href ? '' : `type="${this.type}"`;
    const hrefAttr = href ? `href="${href}"` : '';

    // Simplified rendering with slots support
    this.shadowRoot.innerHTML = `
      ${style}
      <${tag} class="${classes}" ${typeAttr} ${hrefAttr} ${disabledAttr}>
        <slot name="icon">
           ${hasIcon ? `<span class="material-symbols-outlined">${iconName}</span>` : ''}
        </slot>
        <slot>${label}</slot>
      </${tag}>
    `;
  }
}

customElements.define('kds-button', KdsButton);
