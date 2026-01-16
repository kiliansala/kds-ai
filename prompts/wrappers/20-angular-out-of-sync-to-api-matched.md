# KDS-AI — Button Angular Wrapper
Transition: OUT-OF-SYNC → API-MATCHED (STRICT)

MANDATORY CONTEXT
You MUST have already read:
- `prompts/wrappers/00-context.md`
- `REPO_STATE.md`

If any instruction conflicts with those files, they win.

---

## GOAL

Align the Angular Button wrapper with **Button Web Component v1.0.0** with
STRICT parity (no extra inputs/outputs beyond the WC API).

---

## SCOPE

- Wrapper: Angular
- File: `src/wrappers/angular/kds-button.component.ts`
- Canonical source: `src/components/kds-button.ts`
- Dev-app: optional for manual verification
- Storybook: OUT OF SCOPE

---

## STRICT RULES

1. Wrapper public API MUST exactly match WC v1.0.0 public API:
   - same prop names (appearance, state, hasIcon, label, icon, href, type)
   - same value unions
2. Do NOT introduce any wrapper-only inputs/aliases.
3. Do NOT modify Web Component code.
4. Do NOT modify tokens or token pipelines.
5. Slots must be supported with standard Web Component semantics:
   - default slot via projected content
   - icon slot via elements using `slot="icon"` in projected content
6. Events:
   - expose `kds-click` as Angular output without changing payload semantics.

---

## TASKS (EXECUTE IN ORDER)

1. Inspect WC v1.0.0 public API (props/attrs/events/slots).
2. Inspect current Angular wrapper API.
3. Produce a parity table (WC vs Angular):
   - PASS / MISSING / MISMATCH
4. Implement required changes for 100% strict parity:
   - @Input mappings (including hasIcon → has-icon attribute)
   - proper typing (string literal unions)
   - @Output for `kds-click` (typed as CustomEvent)
   - content projection for default slot and icon slot
5. Provide 2 manual usage examples in Angular (in comments or a small example file).
6. Run build/typecheck (whatever is available) and report results.

---

## MANDATORY OUTPUT

A) Strict API Parity Report (Markdown)
- Inputs (must be exactly 7)
- Outputs (must be exactly 1 for kds-click)
- Slots (default + icon via slot="icon")
- Removed/avoided wrapper-only APIs (if any)

B) Commit hash

C) Explicit confirmation:
> “Angular wrapper API exactly matches the WC Button v1.0.0 API with no extra inputs.
> No Web Component code, no token files, and no token pipelines were modified.”

---
End of prompt.