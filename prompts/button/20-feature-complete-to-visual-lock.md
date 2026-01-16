# KDS-AI — Button Lifecycle
Transition: FEATURE-COMPLETE → VISUAL-LOCK

MANDATORY CONTEXT
You MUST have already read:
- `prompts/button/00-context.md`
- `REPO_STATE.md`

If any instruction conflicts with those files, they win.

---

## GOAL

Move the Button from FEATURE-COMPLETE to VISUAL-LOCK by validating
and freezing its visual behavior.

---

## SCOPE

- Component: Button only
- Canonical implementation: Web Component
- Validation source: Dev-app (visual ground truth)
- Storybook: OUT OF SCOPE

---

## STRICT RULES

1. Do NOT add new props, variants, or states.
2. Do NOT modify the Button public API.
3. Do NOT modify token files or token pipelines.
4. Only visual bugfixes are allowed.
5. If something does not match Figma, fix it or report it explicitly.

---

## TASKS (EXECUTE IN ORDER)

1. Define a **visual validation matrix**:
   - Variants × states
   - Include edge cases:
     - icon-only
     - long label
     - disabled + focus (if applicable)
2. Compare Button visuals against the Figma design:
   - layout
   - spacing
   - typography
   - colors
   - states feedback
3. Identify discrepancies:
   - classify each as MUST / SHOULD / COULD
4. Apply ONLY MUST fixes.
5. Update dev-app if needed to better expose discrepancies.
6. Re-run and validate visuals.

---

## MANDATORY OUTPUT

- Visual Validation Report:
  - What matches Figma
  - What differs (with severity)
- List of applied fixes (if any)
- List of known non-blocking issues (if any)
- Explicit confirmation statement:
  > “No API changes and no token files were modified.”

---

End of prompt.