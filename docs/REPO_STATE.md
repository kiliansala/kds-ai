# KDS-AI — Repository State

_Last updated: 2026-01-16_

This document describes the **current factual state** of the repository.
It is intended to be read by humans and AI agents (Claude Haiku, CODEX) to
avoid incorrect assumptions and accidental regressions.

This is **not** a vision document and **not** a roadmap.

---

## 1. Snapshot

- **Branch:** `vscode-copilot`
- **Base commit:** `55b601b` (snapshot-2026-01-14)
- **Upstream reference:** `origin/main` → last Antigravity snapshot

### Working tree (local changes)
The following areas currently contain local modifications or new files:

- Figma tokens
  - `figma/variables.primitive.json`
  - `figma/variables.semantic.json`
  - `figma/variables.components.json`
- Token pipelines and artifacts
  - `scripts/*.mjs`
  - `public/tokens/*.w3c.json`
  - `src/tokens/tokens-data.json`
- Button and dev-app
  - `src/components/kds-button.ts`
  - `src/main.ts`
  - `src/style.css`
  - `src/styles/tokens.css`
- Tooling
  - `package.json`
  - `.vscode/`

---

## 2. Active Decisions (Hard Rules)

These decisions are **currently active** and must not be violated by AI tools
or contributors.

### Storybook
- **Status:** OUT OF SCOPE
- **Rationale:** Storybook is intentionally excluded until:
  - the token system is complete and stable
  - the Button component is finalized and documented
- **Implication:**
  - Do not add Storybook config, addons, stories, or documentation
  - Historical Storybook files/commits may exist but are not part of the active workflow

### Tokens
- Tokens are the **primary focus** of the project at this stage
- The token system is considered **core infrastructure**, not a secondary concern
- Token work takes precedence over UI documentation or showcase tooling

### Canonical Component Source
- **Web Components are the canonical implementation**
- Framework wrappers (Angular, React, Blazor) are derived artifacts
- No framework-specific logic should be introduced unless explicitly decided

---

## 3. Current Focus

The project is currently focused on:

1. **Design Tokens**
   - Importing variables from Figma
   - Normalizing them into W3C Token Format
   - Publishing consumable artifacts

2. **Button Component**
   - Stabilizing the Web Component API
   - Ensuring alignment with tokens
   - Maintaining parity across framework wrappers

3. **Dev Application**
   - Used as the primary way to visualize and validate components
   - Temporarily replaces Storybook for documentation and testing

---

## 4. Token System Status

### Inputs
- Figma exports:
  - `figma/variables.primitive.json`
  - `figma/variables.semantic.json`
  - `figma/variables.components.json`

### Transformation Pipeline
Implemented via scripts in `scripts/`:
- `export-w3c-tokens.mjs`
- `transform-tokens.mjs`
- `sync-tokens.mjs`
- `publish-w3c-to-public.mjs`
- `generate-token-docs.mjs`

The pipeline converts Figma variables into W3C-compliant token collections
(primitives, semantic, components).

### Outputs
- Public artifacts:
  - `public/tokens/tokens.primitive.w3c.json`
  - `public/tokens/tokens.semantic.w3c.json`
  - `public/tokens/tokens.components.w3c.json`
- Internal consolidated data:
  - `src/tokens/tokens-data.json`

---

## 5. Component Status

### Button
- File: `src/components/kds-button.ts`
- Status: Active development
- Characteristics:
  - Token-driven styling
  - Web Component as the reference implementation

### Framework Wrappers
Derived from the Web Component:
- Angular: `src/wrappers/angular/kds-button.component.ts`
- React: `src/wrappers/react/KdsButton.tsx`
- Blazor: `src/wrappers/blazor/KdsButton.razor`

Wrappers must not introduce new behavior beyond adaptation.

---

## 6. Tooling Status

### Dev Application
- Entry point: `src/main.ts`
- Styles:
  - `src/style.css`
  - `src/styles/tokens.css`
- Purpose:
  - Visual validation
  - Manual testing
  - Temporary documentation

### Storybook
- Historical presence only
- Documentation file `contracts/storybook-integration.md` has been removed
- Node dependencies may still exist as legacy remnants
- Not part of the active toolchain

---

## 7. Prompts and Context

The `prompts/` directory contains historical prompts used during earlier phases
(Cursor / Antigravity / Copilot exploration).

These prompts:
- Represent implicit architectural decisions
- Are **not** authoritative by themselves
- Will be distilled into stable rules in `CONTEXT.md`

---

## 8. Risks & Open Points

- Storybook-related files and dependencies still exist in history and tooling
  - Risk of accidental reintroduction
- Large local diffs (token data, generated artifacts)
  - Risk of low signal-to-noise in commits
- CONTEXT.md not yet finalized
  - AI agents must rely on this file once created

---

## 9. Usage Rules for AI Agents

Before making changes, AI agents must:
1. Read this `REPO_STATE.md`
2. Respect all Active Decisions
3. Avoid introducing tooling or workflows marked as out of scope
4. Limit changes to the explicitly requested area

## Token Pipeline Policy

Token changes are considered complete only after the full lifecycle succeeds:

1. npm run tokens:sync
2. npm run tokens:transform
3. npm run tokens:publish
4. npm run tokens:css      (required for dev-app visualization)
5. npm run tokens:build    (required for human documentation)

No step may be skipped unless explicitly stated for a specific purpose.