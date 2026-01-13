import{b as f}from"./lit-element-DzDB2M57.js";class k extends HTMLElement{static get observedAttributes(){return["appearance","state","has-icon","label","icon"]}constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){this.render(),this.setupEventListeners()}attributeChangedCallback(t,l,i){l!==i&&this.render()}get appearance(){return this.getAttribute("appearance")||"filled"}set appearance(t){this.setAttribute("appearance",t)}get state(){return this.getAttribute("state")||"enabled"}set state(t){this.setAttribute("state",t)}get disabled(){return this.state==="disabled"}get hasIcon(){return this.hasAttribute("has-icon")&&this.getAttribute("has-icon")!=="false"}set hasIcon(t){t?this.setAttribute("has-icon",""):this.removeAttribute("has-icon")}get label(){return this.getAttribute("label")||""}get icon(){return this.getAttribute("icon")||"add"}set icon(t){this.setAttribute("icon",t)}get type(){return this.getAttribute("type")||"button"}get href(){return this.getAttribute("href")}setupEventListeners(){this.shadowRoot?.addEventListener("click",t=>{if(this.disabled){t.preventDefault(),t.stopPropagation();return}this.dispatchEvent(new CustomEvent("kds-click",{bubbles:!0,composed:!0,detail:{originalEvent:t}}))})}render(){if(!this.shadowRoot)return;const t=this.appearance,l=this.disabled,i=this.hasIcon,p=this.label,b=this.icon,c=this.href,u=`
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
          border-color: var(--kds-comp-primary);
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
    `,h=l?"disabled":"",m=["kds-btn",`kds-btn--${t}`,`kds-btn--${this.state}`,i?"kds-btn--has-icon":""].join(" "),d=c?"a":"button",g=c?"":`type="${this.type}"`,y=c?`href="${c}"`:"";this.shadowRoot.innerHTML=`
      ${u}
      <${d} class="${m}" ${g} ${y} ${h}>
        <slot name="icon">
           ${i?`<span class="material-symbols-outlined">${b}</span>`:""}
        </slot>
        <slot>${p}</slot>
      </${d}>
    `}}customElements.define("kds-button",k);const v={title:"Components/Button",component:"kds-button",argTypes:{appearance:{name:"Appearance",control:{type:"select"},options:["filled","outlined","text","elevated","tonal"],description:"Visual style matching Figma."},state:{name:"State",control:{type:"select"},options:["enabled","disabled","hovered","focused","pressed"],description:"Interaction state."},hasIcon:{name:"Show Icon",control:{type:"boolean"},description:"Toggles icon visibility."},label:{name:"Label text",control:{type:"text"},description:"Text content."},icon:{name:"Icon name",control:{type:"text"},description:"Icon instance name."}},args:{appearance:"filled",state:"enabled",hasIcon:!1,label:"Button",icon:"add"},render:e=>f`
      <kds-button 
        appearance="${e.appearance}" 
        state="${e.state}" 
        ?has-icon="${e.hasIcon}" 
        label="${e.label}" 
        icon="${e.icon}">
        ${e.label}
      </kds-button>
    `},a={},o={args:{appearance:"outlined"}},s={args:{appearance:"tonal"}},r={args:{state:"disabled"}},n={args:{hasIcon:!0,icon:"favorite"}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:"{}",...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    appearance: 'outlined'
  }
}`,...o.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    appearance: 'tonal'
  }
}`,...s.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    state: 'disabled'
  }
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    hasIcon: true,
    icon: 'favorite'
  }
}`,...n.parameters?.docs?.source}}};const x=["Default","Outlined","Tonal","Disabled","WithIcon"],S=Object.freeze(Object.defineProperty({__proto__:null,Default:a,Disabled:r,Outlined:o,Tonal:s,WithIcon:n,__namedExportsOrder:x,default:v},Symbol.toStringTag,{value:"Module"}));export{S as B,a as D,o as O,s as T,n as W,r as a};
