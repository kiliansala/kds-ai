// Spanish translations for KDS-AI dev-app
export const es = {
  nav: {
    designTokens: 'Design Tokens',
    overview: 'Overview',
    primitives: 'Primitives',
    semantic: 'Semantic',
    components: 'Components',
    componentsDocs: 'Componentes',
    language: 'Idioma',
  },
  
  overview: {
    title: 'Fundamentos del sistema de diseño',
    subtitle: 'Design Tokens',
    description: 'Los design tokens son la base atómica de KDS-AI: valores nombrados que se traducen a código, manteniendo consistencia entre diseño y desarrollo. Representan decisiones de diseño como colores, tipografías, espacios y formas de manera portable y temática.',
    
    ssot: {
      title: 'Figma como Single Source of Truth (SSOT)',
      intro: 'En KDS-AI, <strong>Figma Variables es la única fuente de verdad</strong> para todos los design tokens. Los archivos W3C JSON en <code>dist/tokens/</code> son artefactos generados automáticamente desde Figma y <strong>no deben editarse manualmente</strong>.',
      workflow: 'El flujo de trabajo es unidireccional:',
      step1Title: '1. Figma Variables',
      step1Desc: 'Diseñadores definen y modifican tokens en Figma usando Variables nativas.',
      step2Title: '2. W3C Tokens',
      step2Desc: 'Transformación automática a formato W3C Design Tokens estándar.',
      step3Title: '3. Código',
      step3Desc: 'Desarrolladores consumen tokens vía CSS variables, módulos JS/TS, o recursos nativos.',
      warning: '<strong>⚠️ Importante:</strong> Cualquier cambio en tokens debe realizarse en Figma. Los archivos W3C en <code>dist/</code> se sobrescriben en cada exportación. Las ediciones manuales se perderán.',
    },
    
    whatAreTokens: {
      title: '¿Qué son los design tokens?',
      intro: 'Un design token es un par nombre-valor que representa una decisión de diseño. El nombre permanece estable mientras el valor puede variar según el tema, modo o plataforma. Esta abstracción permite que el mismo token se traduzca a diferentes formatos (CSS variables, recursos nativos, props de componentes) manteniendo la coherencia visual y semántica.',
      w3c: 'En KDS-AI, los tokens siguen el formato W3C Design Tokens, lo que garantiza interoperabilidad con herramientas de diseño, sistemas de build y documentación. Cada token incluye un tipo explícito (<code>$type</code>) y un valor (<code>$value</code>) que puede ser literal o una referencia a otro token mediante la sintaxis de llaves.',
    },
    
    hierarchy: {
      title: 'Jerarquía de tokens',
      intro: 'KDS-AI organiza los tokens en tres niveles jerárquicos que permiten escalar desde valores base hasta decisiones específicas de componentes. Esta estructura facilita el theming, la mantenibilidad y la comprensión del sistema.',
      flow: 'La jerarquía fluye de abajo hacia arriba: los tokens primitivos definen valores fundamentales, los semánticos añaden significado y propósito, y los de componentes aplican estas decisiones a contextos específicos. Cada nivel puede referenciar niveles inferiores, pero nunca al revés, evitando dependencias circulares.',
      
      primitives: 'Valores base',
      primitivesDesc: 'Los tokens primitivos son la capa fundamental del sistema. Contienen valores literales sin semántica de aplicación: colores base, escalas de espacio, tipografías y formas. Estos tokens son agnósticos al contexto y pueden reutilizarse en múltiples escenarios.',
      primitivesDetail: 'Ejemplos incluyen colores de la paleta base como <code>primitive.colors.base.blue</code>, espacios del sistema como <code>primitive.space.space-16</code>, y escalas tipográficas como <code>primitive.typescale.headline-large</code>. Estos valores son estables y raramente cambian, formando la base sobre la que se construye el resto del sistema.',
      
      semanticTitle: 'Intención semántica',
      semanticDesc: 'Los tokens semánticos añaden significado y propósito a los valores primitivos. Expresan intención de diseño como "color primario", "espacio de canvas" o "tipografía de marca", referenciando tokens primitivos mediante alias.',
      semanticDetail: 'Esta capa es crucial para el theming: al cambiar un token semántico, todos los componentes que lo referencian se actualizan automáticamente. Los tokens semánticos también facilitan la comunicación entre diseñadores y desarrolladores, ya que usan un lenguaje común y comprensible.',
      
      componentsTitle: 'Uso en componentes',
      componentsDesc: 'Los tokens de componentes aplican decisiones de diseño a contextos específicos. Referencian tokens semánticos y primitivos para definir estilos particulares de componentes como botones, inputs o cards.',
      componentsDetail: 'Esta capa permite personalización a nivel de componente mientras mantiene la coherencia del sistema. Los tokens de componentes pueden sobrescribir valores semánticos cuando es necesario, pero siempre mantienen la referencia a la jerarquía subyacente para facilitar el theming global.',
    },
    
    governance: {
      title: 'Gobernanza y flujo de trabajo',
      intro: 'Los tokens en KDS-AI siguen un flujo de trabajo controlado que garantiza consistencia y trazabilidad.',
      whoModifies: 'Quién modifica tokens',
      designers: '<strong>Diseñadores:</strong> Únicos autorizados para crear, modificar o eliminar tokens en Figma Variables.',
      developers: '<strong>Desarrolladores:</strong> Consumen tokens generados. No modifican valores directamente.',
      changeProcess: 'Proceso de cambio',
      changeSteps: '1. Diseñador modifica Variables en Figma<br>2. Ejecuta <code>npm run tokens:sync</code> para descargar cambios<br>3. Ejecuta <code>npm run tokens:export</code> para regenerar W3C<br>4. Commit y PR con visual diffs para revisión',
      validation: 'Validación',
      validationItems: 'Los tokens se validan automáticamente en CI/CD para:<br>- Ausencia de referencias circulares<br>- Tipos W3C correctos<br>- Ratios de contraste WCAG (cuando aplique)',
    },
  },
  
  primitives: {
    title: 'Primitives: Valores fundamentales del sistema',
    intro: 'Los tokens primitivos son la capa base de KDS-AI. Contienen <strong>valores literales</strong> sin semántica de aplicación: colores hexadecimales, medidas en píxeles, nombres de fuentes, etc.',
    scope: 'Ámbito y propósito',
    whatAre: '<strong>Qué son:</strong> Valores atómicos, context-agnostic, reutilizables',
    whoDef: '<strong>Quién los define:</strong> Diseñadores en Figma Variables (colección "Primitives")',
    whoConsumes: '<strong>Quién los consume:</strong> Tokens semánticos y de componentes (vía alias)',
    whenUse: '<strong>Cuándo usarlos directamente:</strong> Raramente. Prefiere tokens semánticos en código de producción',
    namingConvention: 'Convención de nombres',
    namingIntro: 'Los tokens primitivos siguen la estructura:',
    namingExample: '<strong>Ejemplo:</strong> <code>primitive.colors.ramps.blue.50</code>',
    
    colorsBase: '<strong>base:</strong> Colores primarios de la paleta (15 colores nombrados: black, white, red, blue, etc.). Valores fijos sin variación de luminosidad.',
    colorsRamps: '<strong>ramps:</strong> Escalas de luminosidad 0-99 para cada color base. 0 = más oscuro, 99 = más claro, 50 = tono medio. Usadas para crear variantes temáticas y estados.',
    colorsModes: '<strong>Modos:</strong> Los colores primitivos no tienen modos light/dark. Los modos se introducen en la capa semántica.',
    
    spaceDesc: 'Escala de espaciado basada en múltiplos de 4px (4, 8, 12, 16, 24, 32, etc.). Usada para márgenes, padding, gaps y dimensiones de elementos.',
    spaceNaming: '<strong>Naming:</strong> <code>space-{value}</code> donde value es el tamaño en píxeles.',
    spaceUsage: '<strong>Uso:</strong> Estos valores son context-agnostic. Para espaciado semántico (ej. "canvas padding"), usar tokens semánticos.',
    
    whenToUse: 'Cuándo usar tokens primitivos',
    useDo: '✓ Usar primitivos cuando:',
    useDoItem1: 'Defines tokens semánticos (vía alias)',
    useDoItem2: 'Necesitas un valor específico no cubierto por semánticos',
    useDoItem3: 'Creas prototipos o experimentos rápidos',
    useDont: '✗ Evitar primitivos cuando:',
    useDontItem1: 'Implementas componentes de producción (usa semánticos)',
    useDontItem2: 'Necesitas theming automático (usa semánticos con modos)',
    useDontItem3: 'El token tiene significado contextual (ej. "color de error")',
    exampleBad: '❌ No recomendado',
    exampleBadReason: 'Acopla el componente a un valor específico, dificulta theming.',
    exampleGood: '✅ Recomendado',
    exampleGoodReason: 'Usa semántica, permite cambiar el color primario sin tocar componentes.',
  },
  
  semantic: {
    title: 'Semantic: Intención y propósito',
    intro: 'Los tokens semánticos añaden <strong>significado y contexto</strong> a los valores primitivos. En lugar de "azul #007AFF", expresan "color primario" o "superficie de canvas".',
    scope: 'Ámbito y propósito',
    whatAre: '<strong>Qué son:</strong> Tokens con nombres descriptivos que expresan intención de uso',
    whoDef: '<strong>Quién los define:</strong> Diseñadores en Figma Variables (colección "Semantic")',
    whoConsumes: '<strong>Quién los consume:</strong> Componentes y tokens de componentes',
    whenUse: '<strong>Cuándo usarlos:</strong> Siempre que sea posible en código de producción',
    
    themingTitle: 'Theming y modos',
    themingIntro: 'Los tokens semánticos habilitan theming mediante <strong>modos</strong>. Un mismo token puede tener valores diferentes según el modo activo (light, dark, high-contrast, etc.).',
    themingExample: 'El mismo token semántico ("black") invierte su valor en dark mode para mantener contraste adecuado.',
    
    aliasTitle: 'Referencias y alias',
    aliasIntro: 'Los tokens semánticos <strong>referencian</strong> tokens primitivos usando la sintaxis <code>{path}</code>. Estos alias:',
    aliasItem1: 'Se resuelven automáticamente al valor final',
    aliasItem2: 'Propagan cambios: si el primitivo cambia, el semántico se actualiza',
    aliasItem3: 'Son navegables: clic en el link lleva al token primitivo',
    
    keyDesc: 'Los "key colors" son colores fundamentales del sistema de theming. Cada key color tiene variantes light/dark que invierten automáticamente en dark mode.',
    keyUsage: '<strong>Uso típico:</strong> Superficies, textos, bordes que deben adaptarse al tema activo.',
    keyDiff: '<strong>Diferencia con primitives:</strong> Los primitives son valores fijos. Los key colors son contextuales y cambian según el modo.',
    
    spaceDesc: 'Espaciado semántico con nombres descriptivos: <code>canvas</code>, <code>row</code>, <code>group</code>, etc.',
    spaceUsage: '<strong>Uso:</strong> Prefiere estos tokens sobre primitives cuando el espaciado tiene significado contextual (ej. "padding de canvas" vs. "16px genérico").',
    
    modesTitle: 'Cómo funcionan los modos',
    modesIntro: 'Los tokens con sufijos <code>.light</code> y <code>.dark</code> representan el mismo concepto semántico con valores diferentes según el tema activo.',
    modesImpl: '<strong>Implementación:</strong> El sistema de theming selecciona automáticamente el modo correcto según la preferencia del usuario o configuración de la aplicación.',
  },
  
  components: {
    title: 'Components: Tokens específicos de componentes',
    intro: 'Los tokens de componentes aplican decisiones de diseño a <strong>contextos específicos</strong>. Refinan tokens semánticos para necesidades particulares de componentes individuales.',
    scope: 'Ámbito y propósito',
    whatAre: '<strong>Qué son:</strong> Tokens acoplados a componentes específicos (Button, Input, Card, etc.)',
    whoDef: '<strong>Quién los define:</strong> Diseñadores en Figma Variables (colección "Components")',
    whoConsumes: '<strong>Quién los consume:</strong> Implementaciones de componentes (Web Components, React, Angular, Blazor)',
    whenUse: '<strong>Cuándo usarlos:</strong> Solo dentro del componente al que pertenecen',
    
    whenCreateTitle: 'Cuándo crear tokens de componente',
    whenCreateIntro: 'Usa tokens de componente cuando:',
    whenCreateItem1: 'Un componente necesita un valor que difiere del semántico estándar',
    whenCreateItem2: 'El valor es específico de ese componente y no reutilizable',
    whenCreateItem3: 'Necesitas sobrescribir un token semántico para un caso de uso particular',
    whenCreateExample: '<strong>Ejemplo:</strong> Un botón primario puede usar <code>components.states.primary.opacity-16.light</code> para estados de interacción específicos del componente.',
    
    hierarchyTitle: 'Jerarquía de consumo',
    hierarchyIntro: 'Los tokens de componente pueden referenciar:',
    hierarchySemantic: '<strong>Tokens semánticos</strong> (preferido): <code>{semantic.space.canvas.regular}</code>',
    hierarchyPrimitive: '<strong>Tokens primitivos</strong> (cuando sea necesario): <code>{primitive.space.space-16}</code>',
    hierarchyWarning: 'Evita referencias circulares: los tokens semánticos no deben referenciar tokens de componentes.',
    
    statesTitle: 'Patrón de estados (States)',
    statesIntro: 'Los tokens en la colección <code>states</code> definen variantes de componentes para diferentes estados de interacción.',
    statesWarning: '<strong>Importante:</strong> Los tokens de estado son específicos de cada componente. No uses <code>components.states.button.*</code> en un componente Input.',
    
    mappingTitle: 'Relación con componentes',
    mappingIntro: 'Los tokens de esta página se consumen en las implementaciones de componentes:',
  },
  
  common: {
    loading: 'Cargando tokens W3C...',
    tokenName: 'Nombre del Token',
    value: 'Valor',
    light: 'Light',
    dark: 'Dark',
    collections: 'Colecciones',
    ungrouped: 'Sin agrupar',
    copy: 'Copiar',
    copied: '✓',
    search: 'Buscar tokens...',
    searchHint: 'Busca por nombre, valor, o tipo (ej. "blue", "#007AFF", "color")',
    backToTop: 'Arriba',
    lastSync: 'Última sincronización:',
    format: 'Formato: W3C Design Tokens 2025.10',
    generatedFrom: 'Tokens generados desde Figma Variables',
    seeMore: 'Ver más',
    seeLess: 'Ver menos',
  },
  
  breadcrumb: {
    designTokens: 'Design Tokens',
  },
  
  validation: {
    wcagAA: 'Cumple WCAG 2.2 AA',
    wcagAAA: 'Cumple WCAG 2.2 AAA',
  },
  
  states: {
    default: 'Estado inicial, sin interacción',
    hover: 'Cursor sobre el elemento',
    pressed: 'Elemento siendo clickeado',
    disabled: 'Elemento no interactivo',
    focus: 'Elemento con foco de teclado',
  },
};
