# MCP Round-Trip Workflow

## Overview

This document defines the automated loop for propagating changes from Figma to Code using MCP agents.

## Workflow

1.  **Figma Event**: A designer updates a component in Figma (e.g., adds a new Variant "Ghost" to Button).
2.  **Detection**: An AI agent running the `figma-dev-mode-mcp-server` detects the change or is prompted by a user (e.g., "Sync Button from Figma").
3.  **Analysis**:
    - The agent reads the new properties from Figma.
    - It compares them against `contracts/component-definitions.json`.
4.  **Contract Update**:
    - If a mismatch is found, the agent updates the JSON contract.
    - Example: Adds `"ghost"` to the `allowedValues` of the `variant` property in `kds-button`.
5.  **Code Regeneration**:
    - The agent identifies `src/components/kds-button.ts`.
    - It updates the component class to handle the new variant (e.g., adds CSS class `.kds-btn--ghost`).
6.  **Verification**:
    - The agent runs the dev server.
    - It verifies the new option appears in the Playground (automatically driven by the JSON contract).

## Code Connect Role

Figma Code Connect ensures that looking at the component in Figma Dev Mode shows the **correct, up-to-date code snippet**.

- When the code is updated, the `figma/button.connect.ts` file should also be checked to ensure the mapping key ('Ghost' -> 'ghost') exists.

## Manual vs Automated

- **Currently**: The agent performs these steps when prompted.
- **Future**: A CI/CD pipeline could trigger this agent autonomously on Figma version cuts.
