# KDS-AI — Project Context

This document defines the **stable, non-negotiable context** of the KDS-AI project.
It acts as a **persistent system prompt** for AI tools and contributors.

This file intentionally changes **rarely**.
For current status and temporary decisions, always refer to `docs/REPO_STATE.md`.

---

## 1. Purpose

KDS-AI exists to define and validate a **design-system architecture** where:

- Figma is the **visual source of truth**
- Design tokens are **machine-readable, vendor-neutral, and W3C-aligned**
- UI components are generated and validated **against tokens**
- The system is consumable by **multiple frameworks** from a single canonical source

The goal is **consistency, traceability, and automation**, not manual UI craftsmanship.

---

## 2. Non-Negotiable Principles

The following principles MUST be respected at all times:

1. **Single Source of Truth (SSOT)**
   - Visual truth lives in Figma
   - Semantic meaning lives in tokens
   - Components reflect tokens, never redefine them

2. **Token-First System**
   - Styling decisions are expressed as tokens
   - Components consume tokens; they do not invent values

3. **Deterministic Outputs**
   - Given the same token input, outputs must be reproducible
   - No hidden logic or implicit styling

4. **Automation Over Manual Work**
   - Repeated manual steps indicate missing scripts or rules

---

## 3. Source of Truth

### Figma
- Figma variables are the authoritative source for:
  - primitives
  - semantic tokens
  - component-level tokens
- Code must adapt to Figma, not the other way around

### Tokens
- Tokens are exported from Figma and transformed into:
  - W3C Token Format
  - consumable CSS / JSON artifacts
- Tokens are the **only allowed bridge** between design and code

---

## 4. Canonical Architecture

### Canonical Component Layer
- **Web Components are the canonical implementation**
- All behavior, structure, and token usage is defined here first

### Derived Layers
- Angular, React, and Blazor components are **wrappers**
- Wrappers adapt APIs but MUST NOT:
  - introduce new behavior
  - redefine styling
  - bypass tokens

---

## 5. Token Strategy

- Tokens are organized into:
  - primitives
  - semantic tokens
  - component tokens
- Tokens follow the **W3C Design Tokens Community Group format**
- Token transformations are explicit and scripted
- Generated artifacts are treated as **build outputs**, not handcrafted files

No hardcoded colors, spacing, typography, or states are allowed in components
unless explicitly defined as tokens.

---

## 6. Component Strategy

- Components are:
  - token-driven
  - stateless where possible
  - predictable in API surface
- Component APIs must map cleanly to:
  - design properties in Figma
  - documented token usage

The Button component is the **first canonical component** and sets the pattern
for all future components.

---

## 7. Tooling Rules

- Tooling must support:
  - token generation
  - component validation
  - multi-framework outputs

- **Storybook is not a foundational dependency**
  - Documentation and validation can be achieved through other means
  - Inclusion of Storybook is a deliberate, explicit decision (see REPO_STATE)

- Scripts are preferred over manual processes
- Local dev tooling must not redefine system rules

---

## 8. AI Operating Rules

AI tools (Claude Haiku, CODEX, etc.) MUST:

1. Read **both**:
   - `docs/CONTEXT.md`
   - `docs/REPO_STATE.md`
2. Respect all non-negotiable principles
3. Avoid introducing:
   - new tooling
   - new architectural layers
   - alternative token strategies
4. Limit changes strictly to what is requested
5. Prefer small, incremental changes over large rewrites

AI tools must **execute**, not reinterpret the system.

---

## 9. Explicitly Out of Scope

Unless explicitly stated otherwise:

- Redesigning Figma structures
- Introducing alternative token models
- Framework-specific styling logic
- Opinionated UI behavior beyond design definitions
- Reintroducing deprecated or paused tooling

Anything not explicitly allowed by this document or by `REPO_STATE.md`
should be considered **out of scope**.

---