// German translations for KDS-AI dev-app
export const de = {
  nav: {
    designTokens: 'Design Tokens',
    overview: 'Übersicht',
    primitives: 'Primitives',
    semantic: 'Semantic',
    components: 'Components',
    componentsDocs: 'Komponenten',
    language: 'Sprache',
  },
  
  overview: {
    title: 'Grundlagen des Design-Systems',
    subtitle: 'Design Tokens',
    description: 'Design Tokens sind die atomare Grundlage von KDS-AI: benannte Werte, die in Code übersetzt werden und Konsistenz zwischen Design und Entwicklung aufrechterhalten. Sie repräsentieren Design-Entscheidungen wie Farben, Typografie, Abstände und Formen auf portable und themenfähige Weise.',
    
    ssot: {
      title: 'Figma als Single Source of Truth (SSOT)',
      intro: 'In KDS-AI sind <strong>Figma Variables die einzige Quelle der Wahrheit</strong> für alle Design Tokens. Die W3C-JSON-Dateien in <code>dist/tokens/</code> sind automatisch generierte Artefakte aus Figma und <strong>dürfen nicht manuell bearbeitet werden</strong>.',
      workflow: 'Der Workflow ist unidirektional:',
      step1Title: '1. Figma Variables',
      step1Desc: 'Designer definieren und ändern Tokens in Figma mit nativen Variables.',
      step2Title: '2. W3C Tokens',
      step2Desc: 'Automatische Transformation in das Standard-W3C-Design-Tokens-Format.',
      step3Title: '3. Code',
      step3Desc: 'Entwickler konsumieren Tokens über CSS-Variablen, JS/TS-Module oder native Ressourcen.',
      warning: '<strong>⚠️ Wichtig:</strong> Alle Token-Änderungen müssen in Figma vorgenommen werden. W3C-Dateien in <code>dist/</code> werden bei jedem Export überschrieben. Manuelle Änderungen gehen verloren.',
    },
    
    whatAreTokens: {
      title: 'Was sind Design Tokens?',
      intro: 'Ein Design Token ist ein Name-Wert-Paar, das eine Design-Entscheidung repräsentiert. Der Name bleibt stabil, während der Wert je nach Theme, Modus oder Plattform variieren kann. Diese Abstraktion ermöglicht es, dass derselbe Token in verschiedene Formate übersetzt wird (CSS-Variablen, native Ressourcen, Komponenten-Props), während visuelle und semantische Kohärenz erhalten bleibt.',
      w3c: 'In KDS-AI folgen Tokens dem W3C-Design-Tokens-Format, was Interoperabilität mit Design-Tools, Build-Systemen und Dokumentation gewährleistet. Jeder Token enthält einen expliziten Typ (<code>$type</code>) und einen Wert (<code>$value</code>), der literal oder eine Referenz auf einen anderen Token mit geschweiften Klammern sein kann.',
    },
    
    hierarchy: {
      title: 'Token-Hierarchie',
      intro: 'KDS-AI organisiert Tokens in drei hierarchischen Ebenen, die eine Skalierung von Basiswerten bis zu komponentenspezifischen Entscheidungen ermöglichen. Diese Struktur erleichtert Theming, Wartbarkeit und Systemverständnis.',
      flow: 'Die Hierarchie fließt von unten nach oben: Primitive Tokens definieren fundamentale Werte, semantische Tokens fügen Bedeutung und Zweck hinzu, und Komponenten-Tokens wenden diese Entscheidungen auf spezifische Kontexte an. Jede Ebene kann niedrigere Ebenen referenzieren, aber niemals umgekehrt, um zirkuläre Abhängigkeiten zu vermeiden.',
      
      primitives: 'Basiswerte',
      primitivesDesc: 'Primitive Tokens sind die grundlegende Schicht des Systems. Sie enthalten literale Werte ohne Anwendungssemantik: Basisfarben, Abstandsskalen, Typografie und Formen. Diese Tokens sind kontextunabhängig und können in mehreren Szenarien wiederverwendet werden.',
      primitivesDetail: 'Beispiele umfassen Basispalettenfarben wie <code>primitive.colors.base.blue</code>, Systemabstände wie <code>primitive.space.space-16</code> und typografische Skalen wie <code>primitive.typescale.headline-large</code>. Diese Werte sind stabil und ändern sich selten und bilden die Grundlage, auf der der Rest des Systems aufgebaut wird.',
      
      semanticTitle: 'Semantische Absicht',
      semanticDesc: 'Semantische Tokens fügen Bedeutung und Zweck zu primitiven Werten hinzu. Sie drücken Design-Absicht aus wie "Primärfarbe", "Canvas-Abstand" oder "Marken-Typografie" und referenzieren primitive Tokens über Aliase.',
      semanticDetail: 'Diese Schicht ist entscheidend für Theming: Wenn sich ein semantischer Token ändert, aktualisieren sich alle Komponenten, die ihn referenzieren, automatisch. Semantische Tokens erleichtern auch die Kommunikation zwischen Designern und Entwicklern durch Verwendung einer gemeinsamen, verständlichen Sprache.',
      
      componentsTitle: 'Komponenten-Verwendung',
      componentsDesc: 'Komponenten-Tokens wenden Design-Entscheidungen auf spezifische Kontexte an. Sie referenzieren semantische und primitive Tokens, um bestimmte Stile für Komponenten wie Buttons, Inputs oder Cards zu definieren.',
      componentsDetail: 'Diese Schicht ermöglicht Anpassungen auf Komponentenebene bei gleichzeitiger Aufrechterhaltung der Systemkohärenz. Komponenten-Tokens können semantische Werte bei Bedarf überschreiben, behalten aber immer die Referenz zur zugrunde liegenden Hierarchie bei, um globales Theming zu erleichtern.',
    },
    
    governance: {
      title: 'Governance und Workflow',
      intro: 'Tokens in KDS-AI folgen einem kontrollierten Workflow, der Konsistenz und Nachvollziehbarkeit gewährleistet.',
      whoModifies: 'Wer ändert Tokens',
      designers: '<strong>Designer:</strong> Nur autorisiert, Tokens in Figma Variables zu erstellen, zu ändern oder zu löschen.',
      developers: '<strong>Entwickler:</strong> Konsumieren generierte Tokens. Ändern Werte nicht direkt.',
      changeProcess: 'Änderungsprozess',
      changeSteps: '1. Designer ändert Variables in Figma<br>2. Führt <code>npm run tokens:sync</code> aus, um Änderungen herunterzuladen<br>3. Führt <code>npm run tokens:export</code> aus, um W3C zu regenerieren<br>4. Commit und PR mit visuellen Diffs zur Überprüfung',
      validation: 'Validierung',
      validationItems: 'Tokens werden automatisch in CI/CD validiert für:<br>- Abwesenheit von zirkulären Referenzen<br>- Korrekte W3C-Typen<br>- WCAG-Kontrastverhältnisse (wenn zutreffend)',
    },
  },
  
  primitives: {
    title: 'Primitives: Fundamentale Systemwerte',
    intro: 'Primitive Tokens sind die Basisschicht von KDS-AI. Sie enthalten <strong>literale Werte</strong> ohne Anwendungssemantik: hexadezimale Farben, Pixelmaße, Schriftartnamen usw.',
    scope: 'Umfang und Zweck',
    whatAre: '<strong>Was sie sind:</strong> Atomare, kontextunabhängige, wiederverwendbare Werte',
    whoDef: '<strong>Wer definiert sie:</strong> Designer in Figma Variables ("Primitives"-Sammlung)',
    whoConsumes: '<strong>Wer konsumiert sie:</strong> Semantische und Komponenten-Tokens (über Aliase)',
    whenUse: '<strong>Wann direkt verwenden:</strong> Selten. Bevorzugen Sie semantische Tokens im Produktionscode',
    namingConvention: 'Namenskonvention',
    namingIntro: 'Primitive Tokens folgen der Struktur:',
    namingExample: '<strong>Beispiel:</strong> <code>primitive.colors.ramps.blue.50</code>',
    
    colorsBase: '<strong>base:</strong> Primäre Palettenfarben (15 benannte Farben: black, white, red, blue usw.). Feste Werte ohne Helligkeitsvariation.',
    colorsRamps: '<strong>ramps:</strong> Helligkeitsskalen 0-99 für jede Basisfarbe. 0 = dunkelste, 99 = hellste, 50 = Mittelton. Verwendet zur Erstellung thematischer Varianten und Zustände.',
    colorsModes: '<strong>Modi:</strong> Primitive Farben haben keine light/dark-Modi. Modi werden in der semantischen Schicht eingeführt.',
    
    spaceDesc: 'Abstandsskala basierend auf 4px-Vielfachen (4, 8, 12, 16, 24, 32 usw.). Verwendet für Ränder, Padding, Lücken und Elementdimensionen.',
    spaceNaming: '<strong>Benennung:</strong> <code>space-{value}</code>, wobei value die Größe in Pixeln ist.',
    spaceUsage: '<strong>Verwendung:</strong> Diese Werte sind kontextunabhängig. Für semantischen Abstand (z.B. "Canvas-Padding") verwenden Sie semantische Tokens.',
    
    whenToUse: 'Wann primitive Tokens verwenden',
    useDo: '✓ Primitives verwenden wenn:',
    useDoItem1: 'Semantische Tokens definiert werden (über Aliase)',
    useDoItem2: 'Ein spezifischer Wert benötigt wird, der nicht von Semantics abgedeckt ist',
    useDoItem3: 'Prototypen oder schnelle Experimente erstellt werden',
    useDont: '✗ Primitives vermeiden wenn:',
    useDontItem1: 'Produktionskomponenten implementiert werden (verwenden Sie Semantics)',
    useDontItem2: 'Automatisches Theming benötigt wird (verwenden Sie Semantics mit Modi)',
    useDontItem3: 'Token kontextuelle Bedeutung hat (z.B. "Fehlerfarbe")',
    exampleBad: '❌ Nicht empfohlen',
    exampleBadReason: 'Koppelt Komponente an spezifischen Wert, behindert Theming.',
    exampleGood: '✅ Empfohlen',
    exampleGoodReason: 'Verwendet Semantik, ermöglicht Änderung der Primärfarbe ohne Berührung von Komponenten.',
  },
  
  semantic: {
    title: 'Semantic: Absicht und Zweck',
    intro: 'Semantische Tokens fügen <strong>Bedeutung und Kontext</strong> zu primitiven Werten hinzu. Anstatt "blau #007AFF" drücken sie "Primärfarbe" oder "Canvas-Oberfläche" aus.',
    scope: 'Umfang und Zweck',
    whatAre: '<strong>Was sie sind:</strong> Tokens mit beschreibenden Namen, die Verwendungsabsicht ausdrücken',
    whoDef: '<strong>Wer definiert sie:</strong> Designer in Figma Variables ("Semantic"-Sammlung)',
    whoConsumes: '<strong>Wer konsumiert sie:</strong> Komponenten und Komponenten-Tokens',
    whenUse: '<strong>Wann verwenden:</strong> Wann immer möglich im Produktionscode',
    
    themingTitle: 'Theming und Modi',
    themingIntro: 'Semantische Tokens ermöglichen Theming durch <strong>Modi</strong>. Derselbe Token kann unterschiedliche Werte haben, abhängig vom aktiven Modus (light, dark, high-contrast usw.).',
    themingExample: 'Derselbe semantische Token ("black") invertiert seinen Wert im Dark Mode, um angemessenen Kontrast zu erhalten.',
    
    aliasTitle: 'Referenzen und Aliase',
    aliasIntro: 'Semantische Tokens <strong>referenzieren</strong> primitive Tokens mit <code>{path}</code>-Syntax. Diese Aliase:',
    aliasItem1: 'Lösen automatisch zum finalen Wert auf',
    aliasItem2: 'Propagieren Änderungen: Wenn sich der Primitive ändert, aktualisiert sich der Semantic',
    aliasItem3: 'Sind navigierbar: Klick auf den Link führt zum primitiven Token',
    
    keyDesc: '"Key colors" sind fundamentale Farben des Theming-Systems. Jede Key-Farbe hat light/dark-Varianten, die automatisch im Dark Mode invertieren.',
    keyUsage: '<strong>Typische Verwendung:</strong> Oberflächen, Text, Rahmen, die sich an das aktive Theme anpassen müssen.',
    keyDiff: '<strong>Unterschied zu Primitives:</strong> Primitives sind feste Werte. Key-Farben sind kontextuell und ändern sich basierend auf dem Modus.',
    
    spaceDesc: 'Semantischer Abstand mit beschreibenden Namen: <code>canvas</code>, <code>row</code>, <code>group</code> usw.',
    spaceUsage: '<strong>Verwendung:</strong> Bevorzugen Sie diese Tokens gegenüber Primitives, wenn der Abstand kontextuelle Bedeutung hat (z.B. "Canvas-Padding" vs. "generische 16px").',
    
    modesTitle: 'Wie Modi funktionieren',
    modesIntro: 'Tokens mit <code>.light</code>- und <code>.dark</code>-Suffixen repräsentieren dasselbe semantische Konzept mit unterschiedlichen Werten abhängig vom aktiven Theme.',
    modesImpl: '<strong>Implementierung:</strong> Das Theming-System wählt automatisch den korrekten Modus basierend auf Benutzerpräferenz oder Anwendungskonfiguration.',
  },
  
  components: {
    title: 'Components: Komponentenspezifische Tokens',
    intro: 'Komponenten-Tokens wenden Design-Entscheidungen auf <strong>spezifische Kontexte</strong> an. Sie verfeinern semantische Tokens für besondere Bedürfnisse einzelner Komponenten.',
    scope: 'Umfang und Zweck',
    whatAre: '<strong>Was sie sind:</strong> Tokens gekoppelt an spezifische Komponenten (Button, Input, Card usw.)',
    whoDef: '<strong>Wer definiert sie:</strong> Designer in Figma Variables ("Components"-Sammlung)',
    whoConsumes: '<strong>Wer konsumiert sie:</strong> Komponenten-Implementierungen (Web Components, React, Angular, Blazor)',
    whenUse: '<strong>Wann verwenden:</strong> Nur innerhalb der Komponente, zu der sie gehören',
    
    whenCreateTitle: 'Wann Komponenten-Tokens erstellen',
    whenCreateIntro: 'Verwenden Sie Komponenten-Tokens wenn:',
    whenCreateItem1: 'Eine Komponente einen Wert benötigt, der vom Standard-Semantic abweicht',
    whenCreateItem2: 'Der Wert spezifisch für diese Komponente und nicht wiederverwendbar ist',
    whenCreateItem3: 'Sie einen semantischen Token für einen bestimmten Anwendungsfall überschreiben müssen',
    whenCreateExample: '<strong>Beispiel:</strong> Ein primärer Button kann <code>components.states.primary.opacity-16.light</code> für komponentenspezifische Interaktionszustände verwenden.',
    
    hierarchyTitle: 'Konsumhierarchie',
    hierarchyIntro: 'Komponenten-Tokens können referenzieren:',
    hierarchySemantic: '<strong>Semantische Tokens</strong> (bevorzugt): <code>{semantic.space.canvas.regular}</code>',
    hierarchyPrimitive: '<strong>Primitive Tokens</strong> (wenn notwendig): <code>{primitive.space.space-16}</code>',
    hierarchyWarning: 'Vermeiden Sie zirkuläre Referenzen: Semantische Tokens sollten keine Komponenten-Tokens referenzieren.',
    
    statesTitle: 'Zustands-Muster',
    statesIntro: 'Tokens in der <code>states</code>-Sammlung definieren Komponentenvarianten für verschiedene Interaktionszustände.',
    statesWarning: '<strong>Wichtig:</strong> Zustands-Tokens sind spezifisch für jede Komponente. Verwenden Sie <code>components.states.button.*</code> nicht in einer Input-Komponente.',
    
    mappingTitle: 'Beziehung zu Komponenten',
    mappingIntro: 'Tokens auf dieser Seite werden in Komponenten-Implementierungen konsumiert:',
  },
  
  common: {
    loading: 'Lade W3C-Tokens...',
    tokenName: 'Token-Name',
    value: 'Wert',
    light: 'Light',
    dark: 'Dark',
    collections: 'Sammlungen',
    ungrouped: 'Nicht gruppiert',
    copy: 'Kopieren',
    copied: '✓',
    search: 'Tokens suchen...',
    searchHint: 'Suche nach Name, Wert oder Typ (z.B. "blue", "#007AFF", "color")',
    backToTop: 'Nach oben',
    lastSync: 'Letzte Synchronisation:',
    format: 'Format: W3C Design Tokens 2025.10',
    generatedFrom: 'Tokens generiert aus Figma Variables',
    seeMore: 'Mehr sehen',
    seeLess: 'Weniger sehen',
  },
  
  breadcrumb: {
    designTokens: 'Design Tokens',
  },
  
  validation: {
    wcagAA: 'Erfüllt WCAG 2.2 AA',
    wcagAAA: 'Erfüllt WCAG 2.2 AAA',
  },
  
  states: {
    default: 'Anfangszustand, keine Interaktion',
    hover: 'Cursor über Element',
    pressed: 'Element wird geklickt',
    disabled: 'Nicht-interaktives Element',
    focus: 'Element mit Tastaturfokus',
  },
};
