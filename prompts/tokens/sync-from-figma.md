<<INCLUDE prompts/_base.md>>

Task:
Sync design tokens from Figma into versioned JSON snapshot files (NO transformation).

Command:
- Run: `npm run tokens:sync`

Scope (MUST):
- Update ONLY:
  - `figma/variables.primitive.json`
  - `figma/variables.semantic.json`
  - `figma/variables.components.json`

Scope (MUST NOT):
- Do not transform to W3C tokens.
- Do not generate CSS or docs.
- Do not modify any component code or dev-app files.

Execution:
1) Print the command you will run.
2) Run `npm run tokens:sync`.
3) If it fails, STOP and report the full error and likely cause.

Verification:
- Confirm ONLY the three `figma/variables.*.json` files changed.
- Confirm they are valid JSON.
- Provide a short diff summary (file sizes / line counts, no full dumps).