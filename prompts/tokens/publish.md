<<INCLUDE prompts/_base.md>>

Task:
Publish existing W3C token artifacts into consumable locations.

Command:
- Run: `npm run tokens:publish`

Scope (MUST NOT):
- Do not modify Figma snapshot files.
- Do not re-run the transform step.
- Do not modify component code.

Execution:
1) Print the command you will run.
2) Run `npm run tokens:publish`.
3) If it fails, STOP and report the full error and likely cause.

Verification:
- Confirm `figma/variables.*.json` did NOT change.
- Confirm `public/tokens/` updated as expected.
- Provide a short diff summary (counts/size, no full dumps).

Optional (only if explicitly requested):
- CSS generation: `npm run tokens:css`
- Docs generation: `npm run tokens:build`