# KDS-AI — Housekeeping
Task: Fix CHANGELOG.md structure and links (NO CODE CHANGES)

MANDATORY CONTEXT
You MUST have already read:
- `REPO_STATE.md`

If any instruction conflicts with REPO_STATE.md, it wins.

---

## GOAL

Clean up `CHANGELOG.md` to:
- Remove duplicated version sections
- Make version structure unambiguous
- Fix and clarify comparison and release links

This is a **documentation-only task**.

---

## STRICT RULES

1. Do NOT modify any source code files.
2. Do NOT modify tokens or token pipelines.
3. Do NOT change version numbers or release semantics.
4. Only edit `CHANGELOG.md`.

---

## CURRENT ISSUES TO FIX

1. There are two duplicated sections:
   - `## [1.0.0] - 2026-01-16`
2. Release links at the bottom only reference:
   - `button-v1.0.0`
   but wrappers also have:
   - `button-wrappers-v1.0.0`
3. The meaning of “global release” vs “component/wrapper tags” is unclear.

---

## TARGET STRUCTURE (APPLY EXACTLY)

### Versions
- Keep **one single** `## [1.0.0] - 2026-01-16` section.
- Inside it, create **two subsections**:
  - `### Added — Button Component v1.0`
  - `### Added — Button Wrappers v1.0`

### Links
At the bottom of the file:
- `[Unreleased]` MUST compare from:
  `button-wrappers-v1.0.0...HEAD`
- `[1.0.0]` MUST link to:
  `https://github.com/kiliansala/kds-ai/releases/tag/button-wrappers-v1.0.0`

Add a short note in the changelog explaining:
- Button Web Component and wrappers are released under separate tags
- The latest tag represents the current stable baseline

---

## TASKS (EXECUTE IN ORDER)

1. Open `CHANGELOG.md`.
2. Merge the duplicated `[1.0.0]` sections into one.
3. Reorganize content under the two subsections described above.
4. Fix the comparison and release links at the bottom.
5. Ensure formatting still follows “Keep a Changelog”.

---

## MANDATORY OUTPUT

A) Short summary of changes made to `CHANGELOG.md`
B) Confirmation statement:
> “Only CHANGELOG.md was modified. No code, tokens, or pipelines were changed.”

---

End of prompt.