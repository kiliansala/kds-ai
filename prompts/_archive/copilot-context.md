# KDS-AI Design System - Microsoft Copilot Context

## Project Overview
KDS-AI is an AI-friendly Design System with **Figma as the Single Source of Truth (SSOT)**. The system manages design tokens in three hierarchical levels and generates Web Components with framework wrappers.

## Core Concept
Design tokens flow unidirectionally from Figma to code:
```
Figma Variables → W3C JSON Tokens → CSS Variables → Components
```

**Critical Rule:** Figma is the ONLY source of truth. W3C JSON files are generated artifacts and must NEVER be edited manually.

## Token Hierarchy (3 Levels)

### 1. Primitives
- **What:** Raw, literal values (hex colors, pixel measurements, font names)
- **Example:** `primitive.colors.base.blue` → `#007AFF`
- **Purpose:** Foundation layer, context-agnostic values

### 2. Semantic
- **What:** Tokens with contextual meaning (aliases to primitives)
- **Example:** `semantic.space.canvas.regular` → `{primitive.space.space-16}`
- **Purpose:** Express design intent, enable theming

### 3. Components
- **What:** Component-specific tokens (aliases to semantic/primitives)
- **Example:** `components.states.primary.opacity-16.light` → rgba value
- **Purpose:** Fine-tune component appearance

**Deduplication Priority:** Primitives > Semantic > Components (tokens defined once at highest level)

## File Structure

### Input (Figma Variables)
```
figma/
├── variables.primitive.json    # Downloaded from Figma
├── variables.semantic.json
└── variables.components.json
```

### Output (W3C Tokens)
```
dist/tokens/
├── tokens.primitive.w3c.json   # Full scope files
├── tokens.semantic.w3c.json
├── tokens.components.w3c.json
└── collections/                 # Split by collection
    ├── tokens.primitive.colors.w3c.json
    ├── tokens.semantic.key.w3c.json
    └── tokens.components.states.w3c.json
```

### Dev App (Documentation)
```
src/
├── main.ts              # Interactive token documentation
├── i18n/                # Trilingual support (EN, ES, DE)
│   ├── index.ts
│   ├── en.ts
│   ├── es.ts
│   └── de.ts
├── components/          # Web Components (Lit)
│   └── kds-button.ts
└── wrappers/            # Framework adapters
    ├── react/KdsButton.tsx
    ├── angular/kds-button.component.ts
    └── blazor/KdsButton.razor
```

## Naming Conventions

### W3C Token Paths
```
<layer>.<collection>.<group>.<token>.<mode?>

Examples:
primitive.colors.base.blue
primitive.colors.ramps.blue.50
semantic.space.canvas.regular
semantic.key.black.light
components.states.primary.opacity-16.light
```

### CSS Variables
```
--kds-{pri|sem|comp}.<collection>.<path>

Examples:
--kds-pri.colors.base.blue
--kds-sem.space.canvas.regular
--kds-comp.states.primary.opacity-16.light
```

## Key Scripts

```bash
# Sync tokens from Figma
npm run tokens:sync

# Generate W3C tokens + copy to public/
npm run tokens:export

# Generate CSS variables
npm run tokens:css

# Start dev server
npm run dev

# Build for production
npm run build
```

## Workflow

### 1. Designer Updates Tokens in Figma
Designer modifies Variables in Figma using native Variables feature.

### 2. Sync from Figma
```bash
npm run tokens:sync
```
Downloads variables to `figma/variables.*.json`

### 3. Export to W3C
```bash
npm run tokens:export
```
- Transforms to W3C format
- Applies deduplication (Primitives > Semantic > Components)
- Generates full + collection files in `dist/tokens/`
- Copies to `public/tokens/` for dev-app

### 4. Dev App Consumes W3C Tokens
Dev-app reads directly from `public/tokens/*.w3c.json` and displays:
- Interactive token tables with light/dark modes
- Color swatches and typography samples
- Navigable alias links
- Copy-to-clipboard functionality
- Comprehensive documentation in 3 languages

## Technologies

- **Web Components:** Lit
- **Build Tool:** Vite
- **Language:** TypeScript
- **Token Format:** W3C Design Tokens 2025.10
- **Styling:** CSS Variables + Material Design 3 principles
- **i18n:** Custom system (EN, ES, DE)

## Dev App Features

### Pages
1. **Overview** - System introduction, Figma as SSOT, token hierarchy
2. **Primitives** - Base values with usage guidance
3. **Semantic** - Contextual tokens with theming explanation
4. **Components** - Component-specific tokens with states pattern

### UI Features
- ✅ Trilingual (English default, Spanish, German)
- ✅ Dynamic light/dark mode columns
- ✅ Color swatches with resolved values
- ✅ Typography samples ("The quick brown fox...")
- ✅ Clickable alias links (navigate between tokens)
- ✅ Copy-to-clipboard for token values
- ✅ Row highlighting on navigation
- ✅ Material Design 3 elevation system
- ✅ Smooth transitions and hover states

## Important Rules

### DO
✅ Modify tokens in Figma Variables
✅ Run `tokens:sync` to download changes
✅ Run `tokens:export` to regenerate W3C files
✅ Commit W3C files in `dist/tokens/`
✅ Use semantic tokens in production code
✅ Follow naming conventions strictly

### DON'T
❌ Edit `figma/variables.*.json` manually
❌ Edit `dist/tokens/*.w3c.json` manually
❌ Use primitive tokens directly in components (use semantic)
❌ Create circular references
❌ Commit `.env` file (contains FIGMA_TOKEN)

## Current Collections

**Primitives:** colors, space, typeface, typescale, shape
**Semantic:** colors, key, space, status, typeface, typescale, typography
**Components:** colors, key, states, components, typescale, typography

## Design System Philosophy

1. **Figma is SSOT** - All token changes originate in Figma
2. **W3C as Handoff Format** - Standard, interoperable token format
3. **Semantic Over Primitive** - Use meaningful names in code
4. **AI-Friendly** - Structured data, JSON-LD metadata, clear documentation
5. **Multilingual** - Accessible to international teams
6. **Material Design 3** - Modern elevation, shape, and motion systems

## Environment Variables

```bash
FIGMA_TOKEN=your_figma_token_here
```

Store in `.env` file (not committed to repo).

## Next Steps

- Implement Badge component (after Button)
- Add CI/CD validation (circular refs, W3C types, WCAG)
- Implement token search/filter
- Expand component documentation

---

**Version:** 1.0.0  
**Last Updated:** 2026-01-15  
**Status:** Production-ready, actively maintained
