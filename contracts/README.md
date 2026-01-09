# kds-ai Component Contracts

## Purpose

This directory contains the canonical, implementation-agnostic definition of all public UI components in `kds-ai`. It serves as the **Single Source of Truth (SSOT)** bridging Figma designs and technical implementation.

The goal is to provide a stable, vendor-neutral contract that ensures predictable synchronization between design and code, specifically tailored for an AI-driven workflow.

## AI Agent Consumption

This contract is explicitly designed to be read, validated, and evolved by AI agents. When interacting with this system, agents must:

1.  **Validate**: Use `component-contract.schema.json` to validate any changes to component definitions.
2.  **Generate**: parsing `component-contract.ts` or `component-contract.md` to generate implementation code (Web Components).
3.  **Restrict**: Ensure generated components expose **STRICTLY** the properties, slots, and events defined in this contract. No assumptions or "smart" additions are allowed.

## Figma → Code → MCP Pipeline

The system operates on a closed-loop pipeline:

1.  **Contract Definition**: Components are formally defined in this directory.
2.  **Code Generation**: Web Components are generated from these definitions.
3.  **Figma Connection**: Components are mapped to Figma nodes using **Figma Code Connect**.
4.  **Synchronization**:
    - A property change in Figma triggers an update via MCP-based agents.
    - The agent updates the contract and the implementation.
    - The change is strictly limited to the exposed API in Figma.
5.  **Visual Verification**: The updated code is immediately verifiable via the generated documentation and Storybook.

## Token Status: PENDING

> **CRITICAL**: Design tokens are currently treated as **opaque external dependencies**.

- This contract does **NOT** define, rename, or normalize tokens.
- We do **NOT** assume a specific token structure (e.g., standard W3C format vs Figma variables).
- Visual definitions (CSS, styles) are out of scope for the contract itself; the contract only defines where tokens are applied (e.g., "accepts a color token").

## Validation Strategy

This contract enables automated validation across multiple platforms without manual intervention:

- **Web Documentation**: Documentation pages are derived directly from the contract metadata.
- **Storybook**: Stories are auto-generated. All variants and states are enumerable, allowing for exhaustive visual testing.
- **Playgrounds**: Live playgrounds allow manipulation of every public property defined here, ensuring the implementation matches the contract 1:1.
