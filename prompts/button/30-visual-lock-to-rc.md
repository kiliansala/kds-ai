# KDS-AI — Button Lifecycle
Transition: VISUAL-LOCK → RC (Release Candidate)

MANDATORY CONTEXT
You MUST have already read:
- `prompts/button/00-context.md`
- `REPO_STATE.md`

If any instruction conflicts with those files, they win.

---

## GOAL

Move Button from VISUAL-LOCK to RC by completing the minimum quality gates:
- a11y validation
- minimum tests (smoke)
- documentation finalization in dev-app
- release readiness checklist

---

## SCOPE

- Component: Button only
- Canonical implementation: Web Component (`src/components/kds-button.ts`)
- Dev-app: documentation + validation only
- Storybook: OUT OF SCOPE

---

## STRICT RULES

1. Do NOT change Button public API.
2. Do NOT add new variants/states/props/events/slots.
3. Do NOT modify token files or token pipeline scripts.
4. Only bugfixes, tests, and documentation improvements are allowed.

---

## TASKS (EXECUTE IN ORDER)

1. A11y checklist (perform and document results):
   - Keyboard: tab navigation, enter/space activation (when applicable)
   - Focus visible: clear and consistent
   - Disabled behavior: not focusable (or correctly handled), aria-disabled usage
   - Semantic correctness: button element usage (or role/button semantics if not)
2. Minimum test suite (add or confirm):
   - Render test (default)
   - Disabled behavior test
   - Attribute/property reflection test (if applicable)
   - Event emission test for `kds-click`
3. Dev-app docs finalize:
   - Clear description (what/when)
   - Props table (from actual API)
   - Usage examples (at least 3)
   - Playground + matrix remain intact
4. Run project checks and report:
   - Unit tests
   - Typecheck/build (whatever is available in repo)
5. Produce an RC checklist with PASS/FAIL + evidence (file refs).

---

## MANDATORY OUTPUT

A) RC Readiness Report (Markdown)
- A11y checklist results (PASS/FAIL)
- Tests added/verified (list + locations)
- Dev-app docs updates (what changed)
- Command results summary (what was run, high-level outcome)

B) Explicit confirmation statement:
> “No API changes and no token files or token pipeline scripts were modified.”

---

End of prompt.