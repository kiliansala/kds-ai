# KDS-AI — Project Context

This document defines the **stable, non-negotiable context** of the KDS-AI project.
It acts as a **persistent system prompt** for AI tools and contributors.

This file intentionally changes **rarely**.
For current status, temporary decisions, and active focus, always refer to
`docs/REPO_STATE.md`.

---

## 1. Purpose

KDS-AI exists to define and validate a **design system architecture** where:

- Figma is the **visual and conceptual source of truth**
- Design tokens are **machine-readable, vendor-neutral, and W3C-aligned**
- UI components are implemented **from tokens**, not from ad-hoc styles
- A single canonical implementation can be consumed by **multiple frameworks**

The objective is **consistency, traceability, and automation**,
not manual UI craftsmanship.

---

## 2. Non-Negotiable Principles

The following principles MUST be respected at all times:

1. **Single Source of Truth (SSOT)**
   - Design intent lives in Figma
   - Semantic meaning lives in tokens
   - Components reflect tokens, never redefine them

2. **Token-First System**
   - All visual and semantic decisions must be expressed as tokens
   - Components consume tokens; they must not invent values

3. **Deterministic and Auditable Outputs**
   - Given the same input snapshots, outputs must be reproducible
   - No implicit state or hidden transformations are allowed

4. **Automation Over Manual Work**
   - Repeated manual steps indicate missing scripts or missing rules
   - Scripts and pipelines are preferred over handcrafted artifacts

---

## 3. Source of Truth

### Figma
- Figma is the **visual and conceptual source of truth**
- It defines:
  - design intent
  - component properties, variants, and states
  - design tokens (primitives, semantic, and component-level)

### Tokens
- Tokens are the **technical source of truth** for styling and semantics
- All design decisions consumed by code MUST be expressed as tokens
- Tokens are versioned, machine-readable artifacts derived from Figma data

---

## 4. Figma Integration (MCP)

Data extraction from Figma (both variables and component definitions)
may be performed via **MCP Figma Server** or equivalent mechanisms.

MCP is considered a **synchronization and extraction layer**, not a source of truth.

### Rules

- MCP MAY be used to import:
  - Figma variables (primitives, semantic, component tokens)
  - component definitions (e.g. Button properties, variants, states)

- All data imported from Figma MUST be:
  - materialized as versioned JSON snapshots in the repository
  - reviewed and committed explicitly

- MCP MUST NOT:
  - introduce implicit or hidden state
  - bypass versioned snapshots
  - generate or modify runtime behavior directly

All downstream processing (token transformation, component implementation,
documentation, and validation) operates exclusively on committed snapshot data.

---

## 5. Canonical Architecture

### Canonical Component Layer
- **Web Components are the canonical implementation**
- All behavior, structure, and token usage is defined here first

### Derived Layers
- Angular, React, and Blazor components are **wrappers**
- Wrappers adapt APIs but MUST NOT:
  - introduce new behavior
  - redefine styling
  - bypass tokens

Wrappers MUST maintain **strict API parity** with the canonical Web Component:

- Same properties (no aliases, no renaming)
- Same events (same names and payload semantics)
- Same slots (standard Web Component slot semantics)

Wrappers MUST NOT:
- Add wrapper-only inputs or parameters
- Provide convenience APIs not present in the Web Component
- Reinterpret events or state handling

If a wrapper diverges from the canonical API, it is considered **out of sync**
and must be corrected before release.

---

## 6. Token Strategy

- Tokens are organized into:
  - primitives
  - semantic tokens
  - component-level tokens

- Tokens follow the **W3C Design Tokens Community Group format**
- Token transformations are explicit and scripted
- Generated artifacts are treated as **build outputs**, not handcrafted files

No hardcoded colors, spacing, typography, or state styling are allowed in
components unless explicitly defined as tokens.

---

## 7. Component Strategy

- Components are:
  - token-driven
  - predictable in API surface
  - stateless where possible

- Component APIs must map cleanly to:
  - design properties in Figma
  - documented token usage

The Button component is the **first canonical component** and establishes the
baseline pattern for all future components.

---

## X. Component Lifecycle (Mandatory)

All components in KDS-AI MUST follow the same lifecycle:

1. **WIP**
2. **FEATURE-COMPLETE**
3. **VISUAL-LOCK**
4. **RC (Release Candidate)**
5. **v1.0 DONE**

Each lifecycle transition:
- Has explicit acceptance criteria
- Is executed and validated via prompts
- Produces verifiable artifacts (code, docs, commits, tags)

No component may:
- Skip lifecycle stages
- Be released without completing the full lifecycle
- Introduce breaking changes after VISUAL-LOCK

The Button component v1.0.0 is the reference implementation of this lifecycle.

---

## 8. Tooling Rules

- Tooling must support:
  - token generation and transformation
  - component validation
  - multi-framework consumption

- **Storybook is not a foundational dependency**
  - Documentation and validation may be achieved through alternative means
  - Inclusion of Storybook is an explicit, deliberate decision

- Scripts are preferred over manual workflows
- Local development tooling must not redefine system rules

### Dev Application

- The dev-app is the **visual validation ground truth**
- If a component cannot be:
  - rendered
  - inspected
  - interacted with
  in the dev-app, it is not considered complete

The dev-app temporarily replaces Storybook for:
- documentation
- visual validation
- manual testing

---

## 9. AI Operating Rules

AI tools (Claude Haiku, CODEX, and similar) MUST:

1. Read **both**:
   - `docs/CONTEXT.md`
   - `docs/REPO_STATE.md`
2. Respect all non-negotiable principles
3. Avoid introducing:
   - new tooling
   - new architectural layers
   - alternative token strategies
4. Limit changes strictly to what is explicitly requested
5. Prefer small, incremental changes over large rewrites

AI tools must **execute and comply**, not reinterpret the system.

---

## 10. Explicitly Out of Scope

Unless explicitly stated otherwise:

- Redesigning Figma structures
- Introducing alternative token models or naming schemes
- Framework-specific styling logic
- Opinionated UI behavior beyond design definitions
- Reintroducing deprecated or paused tooling

Anything not explicitly allowed by this document or by `docs/REPO_STATE.md`
should be considered **out of scope**.