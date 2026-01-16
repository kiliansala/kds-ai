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

Next steps (MANDATORY to complete the token lifecycle):
1) Run `npm run tokens:css` to update CSS variables for dev-app visualization.
2) Run `npm run tokens:build` to update human-readable token documentation.

The token change is NOT considered complete until all steps above succeed.