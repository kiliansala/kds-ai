# KDS-AI — Button Blazor Wrapper
Transition: OUT-OF-SYNC → API-MATCHED (STRICT)

MANDATORY CONTEXT
You MUST have already read:
- `prompts/wrappers/00-context.md`
- `REPO_STATE.md`

If any instruction conflicts with those files, they win.

---

## GOAL

Align the Blazor Button wrapper with **Button Web Component v1.0.0** with
STRICT parity (no wrapper-only parameters beyond WC API).

---

## SCOPE

- Wrapper: Blazor
- File: `src/wrappers/blazor/KdsButton.razor` (and code-behind if exists)
- Canonical source: `src/components/kds-button.ts`
- Storybook: OUT OF SCOPE

---

## STRICT RULES

1. Wrapper public API MUST exactly match WC v1.0.0 public API:
   - same parameter names (appearance, state, hasIcon, label, icon, href, type)
   - same value sets
2. Do NOT introduce wrapper-only parameters or aliases.
3. Do NOT modify Web Component code.
4. Do NOT modify tokens or token pipelines.
5. Slots must be supported with standard Web Component semantics:
   - default slot via ChildContent
   - icon slot via markup that sets `slot="icon"` in rendered output
6. Events:
   - expose `kds-click` without changing payload semantics.

---

## TASKS (EXECUTE IN ORDER)

1. Inspect WC v1.0.0 public API (props/attrs/events/slots).
2. Inspect current Blazor wrapper API.
3. Produce a parity table (WC vs Blazor):
   - PASS / MISSING / MISMATCH
4. Implement required changes for 100% strict parity:
   - [Parameter] mappings to attributes (including hasIcon → has-icon)
   - exact type constraints (enum or string union approach)
   - event binding for `kds-click` (typed as EventCallback / callback pattern)
   - slot support:
     - default slot via ChildContent
     - icon slot via explicit `slot="icon"` wrapper element (no new params)
5. Provide 2 manual usage examples in Blazor (in comments or example file).
6. Run build/typecheck if available and report results.

---

## MANDATORY OUTPUT

A) Strict API Parity Report (Markdown)
- Parameters (must be exactly 7)
- Event binding (kds-click)
- Slots (default + icon)
- Removed/avoided wrapper-only APIs (if any)

B) Commit hash

C) Explicit confirmation:
> “Blazor wrapper API exactly matches the WC Button v1.0.0 API with no extra parameters.
> No Web Component code, no token files, and no token pipelines were modified.”

---
End of prompt.