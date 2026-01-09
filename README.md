# KDS-AI

![Status](https://img.shields.io/badge/Status-Experimental-yellow)
![AI-Readable](https://img.shields.io/badge/AI-Native-blue)

**KDS-AI** is a proof-of-concept Design System architecture optimized for **AI Agent consumption**. It establishes a strict, vendor-neutral contract between Design (Figma) and Code (Web Components), enabling automated synchronization via MCP agents.

## 🤖 AI Agent Onboarding (Start Here)

If you are an AI Agent tasked with working on this repo, follow these instructions strictly:

### 1. Understanding the Source of Truth

- **Primary Contract**: `contracts/component-definitions.json`. ALL changes to API, props, or states MUST begin here.
- **Verification**: Run `npm run validate` to ensure your changes to the JSON match the schema (`contracts/component-contract.schema.json`).

### 2. File Structure

- `/contracts`: The brain of the system.
  - `component-definitions.json`: The data.
  - `mcp-workflow.md`: How to sync with Figma.
  - `storybook-integration.md`: How to generate visual tests.
- `/src/components`: The implementation.
  - Native Web Components (Vanilla JS/TS).
  - Must `observe` attributes defined in the contract.
  - Must `dispatch` events defined in the contract.
- `/figma`: Configs for Figma Code Connect.

### 3. Workflow

1. **Read**: Check the contract for the component definition.
2. **Implement**: Create/Edit `src/components/kds-[name].ts`.
3. **Connect**: Update `figma/[name].connect.ts`.
4. **Validate**: Run `npm run validate`.
5. **Verify**: Run `npm run dev` and check the localhost playground.

## Development

```bash
# Install dependencies
npm install

# Start the documentation server & playground
npm run dev

# Validate system integrity
npm run validate
```
