# KDS-AI — Button Wrappers Release
Transition: API-MATCHED → RC → v1.0 DONE (Wrappers)

MANDATORY CONTEXT
You MUST have already read:
- `prompts/wrappers/00-context.md`
- `REPO_STATE.md`

If any instruction conflicts with those files, they win.

---

## GOAL

Release Button framework wrappers as stable artifacts aligned with
Button Web Component v1.0.0.

Wrappers included:
- React: `src/wrappers/react/KdsButton.tsx`
- Angular: `src/wrappers/angular/kds-button.component.ts`
- Blazor: `src/wrappers/blazor/KdsButton.razor`

---

## STRICT RULES

1. Do NOT modify the Web Component (`src/components/kds-button.ts`).
2. Do NOT modify token files or token pipeline scripts.
3. Do NOT change wrapper APIs (they are already strict-parity).
4. No new features. Only release metadata + minimal verification.

---

## TASKS (EXECUTE IN ORDER)

1. Verification (RC gate):
   - Confirm each wrapper exposes exactly:
     - 7 props/inputs/parameters
     - 1 event (kds-click)
     - 2 slots (default + icon via `slot="icon"`)
   - Confirm build passes (`npm run build` or repo equivalent).
2. Documentation:
   - Create or update `WRAPPERS_RELEASE_NOTES.md` (root) including:
     - Purpose: thin adapters
     - Parity statement: strict parity with WC v1.0.0
     - Usage examples for each framework (2 each minimum)
     - Slot usage pattern (`slot="icon"`)
     - Event handling examples (`kds-click`)
3. Changelog:
   - Add entry to `CHANGELOG.md` for wrappers release (if changelog exists).
   - Include commits:
     - React: da4738b
     - Angular: d810fd9
     - Blazor: 6929809
4. Versioning + tag proposal:
   - Propose a tag for wrappers release: `button-wrappers-v1.0.0`
   - Ensure version references are consistent (if repo uses a single version).
5. Produce final release summary.

---

## MANDATORY OUTPUT

A) Wrappers v1.0 Release Summary (Markdown)
- Included commits
- Parity guarantee statement
- Usage examples references
- Known limitations (if any)

B) Explicit confirmation:
> “Wrappers v1.0 are released with strict parity to Button Web Component v1.0.0.
> No Web Component code, no token files, and no token pipeline scripts were modified.”

---

End of prompt.