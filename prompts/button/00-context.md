# KDS-AI — Button Prompts Context
(VS Code + Copilot / Claude Haiku)

This document is the **mandatory execution context** for any AI-assisted work
on the Button component lifecycle.

It MUST be pasted before running any lifecycle prompt.

---

## Source of truth hierarchy

1. **REPO_STATE.md** (absolute truth)
2. This context file
3. The lifecycle prompt being executed

If any instruction conflicts:
**REPO_STATE.md always wins.**

---

## Canonical rules (hard constraints)

### Storybook
- Status: **OUT OF SCOPE**
- Do NOT:
  - add Storybook config
  - add stories
  - add Storybook documentation
  - reintroduce Storybook tooling accidentally

### Tokens
- Tokens are **core infrastructure**
- Tokens are currently under active work
- Button work must **not force token changes**

Unless explicitly requested, do NOT modify:
- `figma/*.json`
- `public/tokens/*.w3c.json`
- `src/tokens/tokens-data.json`
- `scripts/*.mjs`

### Canonical component source
- **Web Components are canonical**
- Button Web Component is the reference implementation
- Framework wrappers (Angular, React, Blazor):
  - are derived artifacts
  - must not introduce new behavior

---

## Working style (Claude Haiku specific)

Claude Haiku works best when:

- Tasks are **explicit**
- Steps are **ordered**
- Assumptions are **forbidden**
- Outputs are **mandatory and structured**

Therefore:
- Follow tasks strictly in order
- Do not infer missing requirements
- List gaps explicitly instead of guessing
- Always produce the requested outputs

---

## Button lifecycle states

The following lifecycle states are used consistently in this repository:

1. **WIP**
   - API and visuals are unstable
   - Missing variants or states are expected

2. **FEATURE-COMPLETE**
   - All Figma-defined props, variants, states, and events exist
   - Dev-app includes:
     - Playground exposing ALL props
     - Visual matrix (variants × states)

3. **VISUAL-LOCK**
   - Visual behavior is frozen
   - Only bugfixes allowed
   - No API changes

4. **RC (Release Candidate)**
   - Only critical fixes allowed
   - Accessibility, tests, and docs validated

5. **v1.0 DONE**
   - Stable API
   - Final documentation
   - Released and tagged

---

## Allowed scope (default)

### Allowed files
- `src/components/kds-button.ts`
- `src/main.ts`
- `src/style.css`
- `src/styles/tokens.css`
- Dev-app related files only

### Disallowed by default
- Token JSON files
- Token pipeline scripts
- Storybook-related files
- Build or tooling changes not required for Button/dev-app

---

## Validation philosophy

- The **dev-app is the ground truth**
- If it cannot be seen or tested in the dev-app, it is not done
- Prefer:
  - playgrounds
  - visual matrices
  - concrete evidence
over abstract explanations

---

## Execution flow (MANDATORY)

For each lifecycle step:

1. Paste this file (`00-context.md`)
2. Paste the current `REPO_STATE.md`
3. Paste **ONE** lifecycle prompt
4. Execute
5. Review outputs
6. Apply changes
7. Commit
8. Move to the next lifecycle prompt

⚠️ Never run multiple lifecycle prompts at the same time.

---

_End of mandatory context_