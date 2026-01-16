# KDS-AI — Button Wrappers Context
(VS Code + Copilot / Claude Haiku)

This document is the **mandatory execution context** for all Button wrapper work.

It MUST be pasted before running any wrapper lifecycle prompt.

---

## Source of truth hierarchy

1. **Web Component Button v1.0.0** (`src/components/kds-button.ts`)
2. **REPO_STATE.md**
3. This context file
4. Wrapper lifecycle prompt

If any instruction conflicts:
**Web Component v1.0.0 wins.**

---

## Canonical rules (hard constraints)

### Canonical implementation
- **Web Component Button v1.0.0 is the single source of truth**
- Wrappers are **thin adapters**
- Wrappers MUST NOT:
  - introduce new props
  - rename props
  - reinterpret behavior
  - re-style or override tokens

### Tokens
- Tokens v1.0 are stable
- Wrappers must consume WC behavior as-is
- Do NOT reference tokens directly in wrappers

### Scope of wrappers
Wrappers exist only to:
- Map framework idioms → WC API
- Forward attributes / properties / events
- Provide typing and DX improvements

---

## Working style (Claude Haiku)

- No assumptions
- No creativity
- No refactors outside scope
- Follow tasks in order
- Output must be explicit and verifiable

---

## Wrapper lifecycle states

Each wrapper follows this lifecycle:

1. **OUT-OF-SYNC**
2. **API-MATCHED**
3. **RC**
4. **v1.0 DONE**

---

## Validation philosophy

- API parity > visuals
- If wrapper API does not exactly match WC v1.0 → FAIL
- Manual usage examples > Storybook (still OUT OF SCOPE)

---

## Execution flow

For each wrapper:

1. Paste this context file
2. Paste `REPO_STATE.md`
3. Paste ONE wrapper lifecycle prompt
4. Execute
5. Validate output
6. Commit
7. Move to next wrapper

---

_End of wrapper context_