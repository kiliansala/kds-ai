<<INCLUDE prompts/_base.md>>

Task:
Transform Figma snapshot JSON files into W3C Design Token Format artifacts.

Command:
- Run: `npm run tokens:transform`

Inputs (MUST exist, MUST NOT change):
- `figma/variables.primitive.json`
- `figma/variables.semantic.json`
- `figma/variables.components.json`

Scope (MUST NOT):
- Do not publish to `public/` in this step.
- Do not generate CSS or docs.
- Do not modify component code.

Execution:
1) Print the command you will run.
2) Run `npm run tokens:transform`.
3) If it fails, STOP and report the full error and likely cause.

Verification:
- Confirm `figma/variables.*.json` did NOT change.
- List which W3C token files changed/updated.
- Confirm outputs are valid JSON.
- Provide a short diff summary (counts/size, no full dumps).