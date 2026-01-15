# KDS-AI Design System - Contexto de Continuación

## Estado Actual del Proyecto

### Descripción General
KDS-AI es un Design System AI-friendly con Figma como Single Source of Truth (SSOT). El sistema gestiona design tokens en tres niveles jerárquicos (Primitives, Semantic, Components) y genera Web Components (Lit) con wrappers para Angular, React y Blazor.

### Arquitectura de Tokens

**Flujo de trabajo:**
```
Figma Variables → figma/variables.*.json → dist/tokens/**/*.w3c.json → public/tokens/ → Dev-app
```

**Niveles de tokens:**
1. **Primitives**: Valores literales base (colores hex, espacios px, fuentes)
2. **Semantic**: Tokens con significado contextual (alias a primitives)
3. **Components**: Tokens específicos de componentes (alias a semantic/primitives)

**Prioridad de deduplicación:** Primitives > Semantic > Components

### Scripts npm Principales

```bash
npm run tokens:sync      # Descarga variables desde Figma
npm run tokens:export    # Genera W3C tokens + copia a public/
npm run tokens:build     # Genera tokens-data.json (legacy, no usado en W3C view)
npm run tokens:css       # Genera CSS variables
npm run dev              # Dev server
npm run build            # Build producción
```

### Estructura de Archivos Clave

```
/Users/kiliansala/AI/kds-ai/
├── figma/
│   ├── variables.primitive.json    # Input: Variables de Figma
│   ├── variables.semantic.json
│   └── variables.components.json
├── dist/tokens/
│   ├── tokens.primitive.w3c.json   # Output: Tokens W3C completos
│   ├── tokens.semantic.w3c.json
│   ├── tokens.components.w3c.json
│   └── collections/                 # Tokens por colección
│       ├── tokens.primitive.colors.w3c.json
│       ├── tokens.primitive.space.w3c.json
│       ├── tokens.semantic.key.w3c.json
│       └── tokens.components.states.w3c.json
├── public/tokens/                   # Copia de dist/ para dev-app
├── src/
│   ├── main.ts                      # Dev-app principal
│   ├── i18n/
│   │   ├── index.ts                 # Sistema i18n
│   │   ├── es.ts                    # Traducciones español
│   │   ├── en.ts                    # Traducciones inglés
│   │   └── de.ts                    # Traducciones alemán
│   ├── components/
│   │   └── kds-button.ts            # Web Component ejemplo
│   └── wrappers/                    # Wrappers framework
│       ├── react/KdsButton.tsx
│       ├── angular/kds-button.component.ts
│       └── blazor/KdsButton.razor
└── scripts/
    ├── sync-tokens.mjs              # Descarga de Figma
    ├── export-w3c-tokens.mjs        # Exporta a W3C
    ├── publish-w3c-to-public.mjs    # Copia dist/ → public/
    ├── generate-token-docs.mjs      # Genera tokens-data.json
    └── transform-tokens.mjs         # Genera CSS vars
```

### Convención de Nombres

**Tokens W3C:**
```
<layer>.<collection>.<group>.<token>.<mode?>

Ejemplos:
- primitive.colors.base.blue
- primitive.colors.ramps.blue.50
- semantic.space.canvas.regular
- semantic.key.black.light
- components.states.primary.opacity-16.light
```

**CSS Variables:**
```
--kds-{pri|sem|comp}.<collection>.<path>

Ejemplos:
- --kds-pri.colors.base.blue
- --kds-sem.space.canvas.regular
- --kds-comp.states.primary.opacity-16.light
```

### Dev-app (Documentación Interactiva)

**Características implementadas:**
- ✅ Sistema i18n trilingüe (EN, ES, DE) - idioma por defecto: inglés
- ✅ Navegación lateral con drawer y sidebar
- ✅ 4 páginas principales: Overview, Primitives, Semantic, Components
- ✅ Página Overview con:
  - Sección "Figma como SSOT" con pipeline visual
  - Jerarquía de tokens explicada
  - Gobernanza y workflow
  - JSON-LD metadata para AI agents
- ✅ Páginas de tokens con:
  - Introducción contextual por scope
  - Descripciones de colecciones
  - Guías de uso (Do/Don't)
  - Tablas dinámicas con modos light/dark
  - Swatches de color y ejemplos tipográficos
  - Links navegables entre alias
  - Copy-to-clipboard de valores
  - Highlight al navegar a tokens
- ✅ Tokens organizados por colecciones y grupos
- ✅ Sidebar con conteo de tokens
- ✅ Todos los ejemplos usan tokens reales del sistema

**Rutas:**
- `#tokensOverview` - Página principal
- `#tokensW3C/Primitives` - Tokens primitivos
- `#tokensW3C/Semantic` - Tokens semánticos
- `#tokensW3C/Components` - Tokens de componentes
- `#kds-button` - Componente Button (ejemplo)

### Colecciones Reales en el Sistema

**Primitives:**
- colors (base, ramps/red, ramps/orange, ramps/yellow, ramps/green, ramps/blue, etc.)
- space (space-0, space-2, space-4, space-8, space-16, space-24, etc.)
- typeface (brand, plain, weight)
- typescale (headline-large, body-medium, etc.)
- shape

**Semantic:**
- colors
- key
- space (canvas, row, group)
- status
- typeface (brand, plain, weight)
- typescale
- typography

**Components:**
- colors
- key
- states (primary, secondary, on-primary, on-secondary, etc.)
- components
- typescale
- typography

### Tokens W3C: Deduplicación y Alias

**Problema resuelto:** Figma duplica internamente tokens primitivos en archivos semantic/components.

**Solución implementada:**
- `canonicalByKey` (per-file): Mapea tokens por colección+nombre+modo
- `canonicalByNameGlobal` (cross-file): Mapea tokens por nombre+modo (sin colección)
- Prioridad: Primitives > Semantic > Components
- Los duplicados se convierten automáticamente en alias al token canónico

**Ejemplo:**
```json
// Antes (Figma raw):
// semantic.json tiene: "black" → literal "#000000"
// primitive.json tiene: "black" → literal "#000000"

// Después (W3C export):
// primitive.colors.base.black → "#000000" (canónico)
// semantic.key.black.light → "{primitive.colors.base.black}" (alias)
```

### Configuración Importante

**Environment Variables:**
- `FIGMA_TOKEN`: Token de acceso a Figma API (en `.env`, no commitear)

**TypeScript:**
- `tsconfig.json` excluye `src/wrappers` y `FrameworkSnippets.tsx`

**Vite:**
- Base URL: `/kds-ai/`
- Dev server: puerto por defecto

### Estado de Componentes

**Implementado:**
- ✅ kds-button (Web Component + wrappers)

**Pendiente:**
- Badge (siguiente componente a implementar)
- TextField
- Checkbox

### Decisiones de Diseño Clave

1. **Figma es SSOT absoluto**: Los archivos W3C son artefactos generados, NO se editan manualmente
2. **W3C como formato de handoff**: Los tokens W3C en `dist/` son el contrato para desarrolladores
3. **Dev-app consume solo W3C**: No usa `tokens-data.json`, lee directamente de `public/tokens/`
4. **Sin Storybook**: Se eliminó, solo dev-app custom
5. **Breadcrumbs eliminados**: Navegación lateral suficiente
6. **Idioma por defecto inglés**: Con soporte ES y DE

### Últimas Mejoras Implementadas

1. ✅ Eliminado breadcrumb (navegación redundante)
2. ✅ Corregido bug en drawer: `$ {t('nav.semantic')}` → `${t('nav.semantic')}`
3. ✅ Todos los ejemplos actualizados con tokens reales del sistema
4. ✅ Añadido idioma alemán (DE) completo
5. ✅ Cambiado idioma por defecto a inglés (EN)

### Próximos Pasos Sugeridos

1. **Componente Badge**: Implementar siguiente componente del sistema
2. **Validación CI/CD**: Añadir validación automática de tokens (referencias circulares, tipos W3C, WCAG)
3. **Búsqueda de tokens**: Implementar filtro/búsqueda en páginas de tokens
4. **Exportación CSS mejorada**: Generar CSS variables con modos light/dark
5. **Documentación de componentes**: Expandir docs para TextField, Checkbox
6. **Tests**: Añadir tests unitarios para componentes y scripts

### Comandos Útiles para Debugging

```bash
# Ver estructura de tokens W3C
cat dist/tokens/tokens.primitive.w3c.json | jq '.primitive | keys'

# Buscar token específico
grep -r "primary" dist/tokens/collections/

# Validar JSON
cat dist/tokens/tokens.semantic.w3c.json | jq empty

# Ver logs de dev server
npm run dev

# Regenerar todo desde Figma
npm run tokens:sync && npm run tokens:export
```

### Notas Importantes

- **No modificar**: `figma/variables.*.json` (generados por sync)
- **No modificar**: `dist/tokens/**/*.w3c.json` (generados por export)
- **No commitear**: `.env`, `figma/variables.*.json`, `dist/`, `public/tokens/`
- **Sí commitear**: Scripts, src/, docs, contracts/

### Contacto y Referencias

- Formato W3C: https://www.designtokens.org/tr/2025.10/format/
- Figma Variables API: https://www.figma.com/developers/api#variables
- Lit Web Components: https://lit.dev/

---

**Última actualización:** 2026-01-15
**Versión del sistema:** 1.0.0
**Estado:** Documentación completa, sistema funcional, listo para Badge component
