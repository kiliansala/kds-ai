// English translations for KDS-AI dev-app
export const en = {
  nav: {
    designTokens: 'Design Tokens',
    overview: 'Overview',
    primitives: 'Primitives',
    semantic: 'Semantic',
    components: 'Components',
    componentsDocs: 'Components',
    language: 'Language',
  },
  
  overview: {
    title: 'Design System Fundamentals',
    subtitle: 'Design Tokens',
    description: 'Design tokens are the atomic foundation of KDS-AI: named values that translate to code, maintaining consistency between design and development. They represent design decisions like colors, typography, spacing, and shapes in a portable and themeable way.',
    
    ssot: {
      title: 'Figma as Single Source of Truth (SSOT)',
      intro: 'In KDS-AI, <strong>Figma Variables is the single source of truth</strong> for all design tokens. The W3C JSON files in <code>dist/tokens/</code> are automatically generated artifacts from Figma and <strong>must not be edited manually</strong>.',
      workflow: 'The workflow is unidirectional:',
      step1Title: '1. Figma Variables',
      step1Desc: 'Designers define and modify tokens in Figma using native Variables.',
      step2Title: '2. W3C Tokens',
      step2Desc: 'Automatic transformation to standard W3C Design Tokens format.',
      step3Title: '3. Code',
      step3Desc: 'Developers consume tokens via CSS variables, JS/TS modules, or native resources.',
      warning: '<strong>⚠️ Important:</strong> Any token changes must be made in Figma. W3C files in <code>dist/</code> are overwritten on each export. Manual edits will be lost.',
    },
    
    whatAreTokens: {
      title: 'What are design tokens?',
      intro: 'A design token is a name-value pair that represents a design decision. The name remains stable while the value can vary by theme, mode, or platform. This abstraction allows the same token to translate to different formats (CSS variables, native resources, component props) while maintaining visual and semantic coherence.',
      w3c: 'In KDS-AI, tokens follow the W3C Design Tokens format, ensuring interoperability with design tools, build systems, and documentation. Each token includes an explicit type (<code>$type</code>) and a value (<code>$value</code>) that can be literal or a reference to another token using curly brace syntax.',
    },
    
    hierarchy: {
      title: 'Token hierarchy',
      intro: 'KDS-AI organizes tokens into three hierarchical levels that enable scaling from base values to component-specific decisions. This structure facilitates theming, maintainability, and system comprehension.',
      flow: 'The hierarchy flows bottom-up: primitive tokens define fundamental values, semantic tokens add meaning and purpose, and component tokens apply these decisions to specific contexts. Each level can reference lower levels, but never vice versa, avoiding circular dependencies.',
      
      primitives: 'Base values',
      primitivesDesc: 'Primitive tokens are the foundational layer of the system. They contain literal values without application semantics: base colors, spacing scales, typography, and shapes. These tokens are context-agnostic and can be reused across multiple scenarios.',
      primitivesDetail: 'Examples include base palette colors like <code>primitive.colors.base.blue</code>, system spacing like <code>primitive.space.space-16</code>, and typographic scales like <code>primitive.typescale.headline-large</code>. These values are stable and rarely change, forming the foundation upon which the rest of the system is built.',
      
      semanticTitle: 'Semantic intent',
      semanticDesc: 'Semantic tokens add meaning and purpose to primitive values. They express design intent like "primary color", "canvas spacing", or "brand typography", referencing primitive tokens via aliases.',
      semanticDetail: 'This layer is crucial for theming: when a semantic token changes, all components referencing it update automatically. Semantic tokens also facilitate communication between designers and developers by using a common, understandable language.',
      
      componentsTitle: 'Component usage',
      componentsDesc: 'Component tokens apply design decisions to specific contexts. They reference semantic and primitive tokens to define particular styles for components like buttons, inputs, or cards.',
      componentsDetail: 'This layer enables component-level customization while maintaining system coherence. Component tokens can override semantic values when necessary, but always maintain the reference to the underlying hierarchy to facilitate global theming.',
    },
    
    governance: {
      title: 'Governance and workflow',
      intro: 'Tokens in KDS-AI follow a controlled workflow that ensures consistency and traceability.',
      whoModifies: 'Who modifies tokens',
      designers: '<strong>Designers:</strong> Only authorized to create, modify, or delete tokens in Figma Variables.',
      developers: '<strong>Developers:</strong> Consume generated tokens. Do not modify values directly.',
      changeProcess: 'Change process',
      changeSteps: '1. Designer modifies Variables in Figma<br>2. Run <code>npm run tokens:sync</code> to download changes<br>3. Run <code>npm run tokens:export</code> to regenerate W3C<br>4. Commit and PR with visual diffs for review',
      validation: 'Validation',
      validationItems: 'Tokens are automatically validated in CI/CD for:<br>- Absence of circular references<br>- Correct W3C types<br>- WCAG contrast ratios (when applicable)',
    },
  },
  
  primitives: {
    title: 'Primitives: System fundamental values',
    intro: 'Primitive tokens are the base layer of KDS-AI. They contain <strong>literal values</strong> without application semantics: hexadecimal colors, pixel measurements, font names, etc.',
    scope: 'Scope and purpose',
    whatAre: '<strong>What they are:</strong> Atomic, context-agnostic, reusable values',
    whoDef: '<strong>Who defines them:</strong> Designers in Figma Variables ("Primitives" collection)',
    whoConsumes: '<strong>Who consumes them:</strong> Semantic and component tokens (via aliases)',
    whenUse: '<strong>When to use directly:</strong> Rarely. Prefer semantic tokens in production code',
    namingConvention: 'Naming convention',
    namingIntro: 'Primitive tokens follow the structure:',
    namingExample: '<strong>Example:</strong> <code>primitive.colors.ramps.blue.50</code>',
    
    colorsBase: '<strong>base:</strong> Primary palette colors (15 named colors: black, white, red, blue, etc.). Fixed values without luminosity variation.',
    colorsRamps: '<strong>ramps:</strong> Luminosity scales 0-99 for each base color. 0 = darkest, 99 = lightest, 50 = mid-tone. Used to create thematic variants and states.',
    colorsModes: '<strong>Modes:</strong> Primitive colors have no light/dark modes. Modes are introduced in the semantic layer.',
    
    spaceDesc: 'Spacing scale based on 4px multiples (4, 8, 12, 16, 24, 32, etc.). Used for margins, padding, gaps, and element dimensions.',
    spaceNaming: '<strong>Naming:</strong> <code>space-{value}</code> where value is the size in pixels.',
    spaceUsage: '<strong>Usage:</strong> These values are context-agnostic. For semantic spacing (e.g., "canvas padding"), use semantic tokens.',
    
    whenToUse: 'When to use primitive tokens',
    useDo: '✓ Use primitives when:',
    useDoItem1: 'Defining semantic tokens (via aliases)',
    useDoItem2: 'Need a specific value not covered by semantics',
    useDoItem3: 'Creating prototypes or quick experiments',
    useDont: '✗ Avoid primitives when:',
    useDontItem1: 'Implementing production components (use semantics)',
    useDontItem2: 'Need automatic theming (use semantics with modes)',
    useDontItem3: 'Token has contextual meaning (e.g., "error color")',
    exampleBad: '❌ Not recommended',
    exampleBadReason: 'Couples component to specific value, hinders theming.',
    exampleGood: '✅ Recommended',
    exampleGoodReason: 'Uses semantics, allows changing primary color without touching components.',
  },
  
  semantic: {
    title: 'Semantic: Intent and purpose',
    intro: 'Semantic tokens add <strong>meaning and context</strong> to primitive values. Instead of "blue #007AFF", they express "primary color" or "canvas surface".',
    scope: 'Scope and purpose',
    whatAre: '<strong>What they are:</strong> Tokens with descriptive names expressing usage intent',
    whoDef: '<strong>Who defines them:</strong> Designers in Figma Variables ("Semantic" collection)',
    whoConsumes: '<strong>Who consumes them:</strong> Components and component tokens',
    whenUse: '<strong>When to use them:</strong> Whenever possible in production code',
    
    themingTitle: 'Theming and modes',
    themingIntro: 'Semantic tokens enable theming through <strong>modes</strong>. The same token can have different values depending on the active mode (light, dark, high-contrast, etc.).',
    themingExample: 'The same semantic token ("black") inverts its value in dark mode to maintain adequate contrast.',
    
    aliasTitle: 'References and aliases',
    aliasIntro: 'Semantic tokens <strong>reference</strong> primitive tokens using <code>{path}</code> syntax. These aliases:',
    aliasItem1: 'Resolve automatically to the final value',
    aliasItem2: 'Propagate changes: if the primitive changes, the semantic updates',
    aliasItem3: 'Are navigable: clicking the link goes to the primitive token',
    
    keyDesc: '"Key colors" are fundamental colors of the theming system. Each key color has light/dark variants that automatically invert in dark mode.',
    keyUsage: '<strong>Typical usage:</strong> Surfaces, text, borders that must adapt to the active theme.',
    keyDiff: '<strong>Difference from primitives:</strong> Primitives are fixed values. Key colors are contextual and change based on mode.',
    
    spaceDesc: 'Semantic spacing with descriptive names: <code>canvas</code>, <code>row</code>, <code>group</code>, etc.',
    spaceUsage: '<strong>Usage:</strong> Prefer these tokens over primitives when spacing has contextual meaning (e.g., "canvas padding" vs. "generic 16px").',
    
    modesTitle: 'How modes work',
    modesIntro: 'Tokens with <code>.light</code> and <code>.dark</code> suffixes represent the same semantic concept with different values depending on the active theme.',
    modesImpl: '<strong>Implementation:</strong> The theming system automatically selects the correct mode based on user preference or application configuration.',
  },
  
  components: {
    title: 'Components: Component-specific tokens',
    intro: 'Component tokens apply design decisions to <strong>specific contexts</strong>. They refine semantic tokens for particular needs of individual components.',
    scope: 'Scope and purpose',
    whatAre: '<strong>What they are:</strong> Tokens coupled to specific components (Button, Input, Card, etc.)',
    whoDef: '<strong>Who defines them:</strong> Designers in Figma Variables ("Components" collection)',
    whoConsumes: '<strong>Who consumes them:</strong> Component implementations (Web Components, React, Angular, Blazor)',
    whenUse: '<strong>When to use them:</strong> Only within the component they belong to',
    
    whenCreateTitle: 'When to create component tokens',
    whenCreateIntro: 'Use component tokens when:',
    whenCreateItem1: 'A component needs a value that differs from the standard semantic',
    whenCreateItem2: 'The value is specific to that component and not reusable',
    whenCreateItem3: 'You need to override a semantic token for a particular use case',
    whenCreateExample: '<strong>Example:</strong> A primary button can use <code>components.states.primary.opacity-16.light</code> for component-specific interaction states.',
    
    hierarchyTitle: 'Consumption hierarchy',
    hierarchyIntro: 'Component tokens can reference:',
    hierarchySemantic: '<strong>Semantic tokens</strong> (preferred): <code>{semantic.space.canvas.regular}</code>',
    hierarchyPrimitive: '<strong>Primitive tokens</strong> (when necessary): <code>{primitive.space.space-16}</code>',
    hierarchyWarning: 'Avoid circular references: semantic tokens should not reference component tokens.',
    
    statesTitle: 'States pattern',
    statesIntro: 'Tokens in the <code>states</code> collection define component variants for different interaction states.',
    statesWarning: '<strong>Important:</strong> State tokens are specific to each component. Do not use <code>components.states.button.*</code> in an Input component.',
    
    mappingTitle: 'Relationship with components',
    mappingIntro: 'Tokens on this page are consumed in component implementations:',
  },
  
  common: {
    loading: 'Loading W3C tokens...',
    tokenName: 'Token Name',
    value: 'Value',
    light: 'Light',
    dark: 'Dark',
    collections: 'Collections',
    ungrouped: 'Ungrouped',
    copy: 'Copy',
    copied: '✓',
    search: 'Search tokens...',
    searchHint: 'Search by name, value, or type (e.g., "blue", "#007AFF", "color")',
    backToTop: 'Top',
    lastSync: 'Last sync:',
    format: 'Format: W3C Design Tokens 2025.10',
    generatedFrom: 'Tokens generated from Figma Variables',
    seeMore: 'See more',
    seeLess: 'See less',
  },
  
  breadcrumb: {
    designTokens: 'Design Tokens',
  },
  
  validation: {
    wcagAA: 'Meets WCAG 2.2 AA',
    wcagAAA: 'Meets WCAG 2.2 AAA',
  },
  
  states: {
    default: 'Initial state, no interaction',
    hover: 'Cursor over element',
    pressed: 'Element being clicked',
    disabled: 'Non-interactive element',
    focus: 'Element with keyboard focus',
  },
};
