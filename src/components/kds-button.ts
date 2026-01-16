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
      'appearance',
      'state',
      'has-icon',
      'label',
      'icon',
      'href',
      'type'
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
  set type(val) { this.setAttribute('type', val); }
  get href() { return this.getAttribute('href'); }
  set href(val) { val ? this.setAttribute('href', val) : this.removeAttribute('href'); }
  
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
    const isLink = Boolean(href);

    // Compute token values from root CSS variables
    const getComputedToken = (cssVar: string, fallback: string) => {
      const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
      return value || fallback;
    };

    const primaryLight = getComputedToken('--kds-components.components.primary.light', '#1484FF');
    const onPrimaryLight = getComputedToken('--kds-components.components.on-primary.light', '#FFFFFF');
    const hoverLight = getComputedToken('--kds-components.components.hover.light', '#1673E8');
    const secondaryContainerLight = getComputedToken('--kds-components.components.secondary-container.light', '#ADACEB');
    const onSecondaryContainerLight = getComputedToken('--kds-components.components.on-secondary-container.light', '#1B1A6A');
    const surfaceContainerLowLight = getComputedToken('--kds-components.components.surface-container-low.light', '#F2F2F2');
    const onSurfaceVariantLight = getComputedToken('--kds-components.components.on-surface-variant.light', '#49454F');
    const outlineVariantLight = getComputedToken('--kds-components.components.outline-variant.light', '#C1C1C4');

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
          background-color: ${primaryLight};
          color: ${onPrimaryLight};
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
            opacity: 0.08;
        }
        
        .kds-btn:focus-visible::after,
        .kds-btn--focused::after {
            opacity: 0.12;
        }
        .kds-btn:focus-visible,
        .kds-btn--focused {
          outline: 2px solid ${outlineVariantLight};
          outline-offset: 2px;
        }

        .kds-btn:active::after,
        .kds-btn--pressed::after {
            opacity: 0.16;
        }

        .kds-btn--filled:hover,
        .kds-btn--filled.kds-btn--hovered {
          box-shadow: 0 1px 3px 1px rgba(0,0,0,0.15); 
          background-color: ${hoverLight};
        }

        .kds-btn--outlined {
          background-color: transparent;
          border-color: ${primaryLight};
          color: ${primaryLight};
          border-width: 1px;
        }

        .kds-btn--outlined:hover::after,
        .kds-btn--outlined.kds-btn--hovered::after {
          opacity: 0.08;
        }

        .kds-btn--outlined.kds-btn--disabled {
          border-color: ${onSurfaceVariantLight};
          opacity: 0.5;
        }
        
        .kds-btn--text {
            background-color: transparent;
            color: ${primaryLight};
            padding: 0 12px;
        }

        .kds-btn--text:hover::after,
        .kds-btn--text.kds-btn--hovered::after {
          opacity: 0.08;
          background-color: ${primaryLight};
        }

        .kds-btn--text:focus-visible::after,
        .kds-btn--text.kds-btn--focused::after {
          opacity: 0.12;
          background-color: ${primaryLight};
        }

        .kds-btn--text:active::after,
        .kds-btn--text.kds-btn--pressed::after {
          opacity: 0.16;
          background-color: ${primaryLight};
        }
        
        .kds-btn--tonal {
            background-color: ${secondaryContainerLight};
            color: ${onSecondaryContainerLight};
        }

        .kds-btn--tonal:hover::after,
        .kds-btn--tonal.kds-btn--hovered::after {
          opacity: 0.08;
        }

        .kds-btn--tonal:focus-visible::after,
        .kds-btn--tonal.kds-btn--focused::after {
          opacity: 0.12;
        }

        .kds-btn--tonal:active::after,
        .kds-btn--tonal.kds-btn--pressed::after {
          opacity: 0.16;
        }
        
        .kds-btn--elevated {
            background-color: ${surfaceContainerLowLight};
            color: ${primaryLight};
            box-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        .kds-btn--elevated:hover::after,
        .kds-btn--elevated.kds-btn--hovered::after {
          opacity: 0.08;
          box-shadow: 0 2px 4px rgba(0,0,0,0.4);
        }

        .kds-btn--elevated:focus-visible::after,
        .kds-btn--elevated.kds-btn--focused::after {
          opacity: 0.12;
        }

        .kds-btn--elevated:active::after,
        .kds-btn--elevated.kds-btn--pressed::after {
          opacity: 0.16;
          box-shadow: 0 1px 3px rgba(0,0,0,0.35);
        }

        /* States (Disabled) */
        .kds-btn--disabled {
          background-color: ${surfaceContainerLowLight};
          color: ${onSurfaceVariantLight};
          cursor: not-allowed;
          box-shadow: none !important;
          pointer-events: none;
          border-color: transparent;
        }

        /* Icon Stub - Now using Real Material Symbols */
        .material-symbols-outlined {
            font-size: 18px;
            line-height: 1;
        }
      </style>
      <!-- We need to import the font style inside Shadow DOM or use a constructed stylesheet -->
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
    `;

    const disabledAttr = disabled ? 'disabled' : '';
    const ariaDisabled = disabled ? 'aria-disabled="true"' : '';
    const tabIndex = disabled && isLink ? 'tabindex="-1"' : '';
    const roleAttr = isLink ? 'role="button"' : '';
    const classes = [
      'kds-btn',
      `kds-btn--${appearance}`,
      `kds-btn--${this.state}`,
      hasIcon ? 'kds-btn--has-icon' : ''
    ].join(' ');
    
    const tag = isLink ? 'a' : 'button';
    const typeAttr = href ? '' : `type="${this.type}"`;
    const hrefAttr = href && !disabled ? `href="${href}"` : '';

    // Simplified rendering with slots support
    this.shadowRoot.innerHTML = `
      ${style}
      <${tag} class="${classes}" ${typeAttr} ${hrefAttr} ${disabledAttr} ${ariaDisabled} ${tabIndex} ${roleAttr}>
        <slot name="icon">
           ${hasIcon ? `<span class="material-symbols-outlined">${iconName}</span>` : ''}
        </slot>
        <slot>${label}</slot>
      </${tag}>
    `;
  }
}

customElements.define('kds-button', KdsButton);
