# KDS-AI — Button Lifecycle
Transition: WIP → FEATURE-COMPLETE

MANDATORY CONTEXT
You MUST have already read:
- `prompts/button/00-context.md`
- `REPO_STATE.md`

If any instruction conflicts with those files, they win.

---

## GOAL

Move the Button Web Component from **WIP** to **FEATURE-COMPLETE**.

---

## SCOPE

- Component: Button only
- Canonical implementation: Web Component
- File: `src/components/kds-button.ts`
- Validation & documentation: Dev-app only
- Storybook: OUT OF SCOPE

---

## STRICT RULES

1. Do NOT modify any token JSON files or token pipeline scripts.
2. Do NOT introduce Storybook or related tooling.
3. Do NOT modify framework wrappers.
4. Do NOT assume missing requirements — list them explicitly.
5. Web Component API must reflect the Figma Button properties.

---

## TASKS (EXECUTE IN ORDER)

1. Inspect the current Button Web Component API:
   - properties / attributes
   - variants
   - states
   - events
2. List what is currently implemented.
3. Compare against the expected Button contract from Figma.
4. Identify what is missing to reach FEATURE-COMPLETE.
5. Implement missing functionality incrementally.
6. Update the dev-app:
   - Ensure a playground exists exposing **ALL Button props**
   - Ensure a visual matrix exists showing **variants × states**
7. Run and visually validate the dev-app.

---

## MANDATORY OUTPUT

- Summary of changes
- Checklist (PASS / MISSING):
  - API completeness
  - Variant coverage
  - State coverage
  - Event coverage
  - Dev-app playground
  - Visual matrix
- Explicit confirmation statement:
  > “No token files or token pipeline scripts were modified.”

---

End of prompt.