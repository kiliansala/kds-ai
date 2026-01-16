# KDS-AI — Button React Wrapper
Transition: OUT-OF-SYNC → API-MATCHED

MANDATORY CONTEXT
You MUST have already read:
- `prompts/wrappers/00-context.md`
- `REPO_STATE.md`

If any instruction conflicts with those files, they win.

---

## GOAL

Align the React Button wrapper with **Button Web Component v1.0.0**.

---

## SCOPE

- Wrapper: React
- File: `src/wrappers/react/KdsButton.tsx`
- Canonical source: `src/components/kds-button.ts`
- Dev-app: optional for manual verification
- Storybook: OUT OF SCOPE

---

## STRICT RULES

1. Wrapper API MUST exactly match the WC public API:
   - same props
   - same names
   - same defaults
2. Do NOT introduce new props or aliases.
3. Do NOT reinterpret events.
4. Do NOT modify Web Component code.
5. Do NOT modify tokens or token pipelines.

---

## TASKS (EXECUTE IN ORDER)

1. Inspect WC Button v1.0.0 public API:
   - properties
   - attributes
   - events
   - slots
2. Inspect current React wrapper API.
3. Produce a **parity table**:
   - WC API vs React props
   - PASS / MISSING / MISMATCH
4. Implement required changes in the React wrapper to achieve 100% parity:
   - prop forwarding
   - attribute mapping
   - event binding (`kds-click`)
   - ref forwarding (if applicable)
5. Add or update TypeScript types to reflect the exact API.
6. Provide at least **2 manual usage examples** (inline or docs comments).

---

## MANDATORY OUTPUT

A) API Parity Report (Markdown):
- Properties: PASS / MISSING / MISMATCH
- Events: PASS / MISSING
- Slots: PASS / MISSING
- Notes on defaults handling

B) Summary of changes

C) Explicit confirmation statement:
> “React wrapper API now exactly matches Button Web Component v1.0.0.
> No Web Component code, no token files, and no token pipelines were modified.”

---

End of prompt.