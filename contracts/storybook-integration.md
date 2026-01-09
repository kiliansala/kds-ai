# Storybook Integration Strategy

## Overview

This document defines how `kds-ai` components are automatically adapted for Storybook using the `component-definitions.json` contract.

## AI Agent Instructions

An AI agent generating Storybook stories must follow this mapping strategy:

### 1. Meta Generation (`*.stories.ts`)

The `meta` object for each component should be derived as follows:

- **title**: `Components/{{Name}}`
- **component**: Import the custom element class.
- **tags**: `['autodocs']`
- **argTypes**: Map each property in `component.properties` to a Storybook control:

| Contract Type | Storybook Control  | Logic                            |
| ------------- | ------------------ | -------------------------------- |
| `string`      | `text`             | Default.                         |
| `boolean`     | `boolean`          | Default.                         |
| `enum`        | `select` / `radio` | Use `allowedValues` for options. |
| `number`      | `number`           | Default.                         |

### 2. Story Generation

For each component, generate the following stories automatically:

- **Default**: Uses `default` values from the contract.
- **States**: Generate a story for each boolean property (e.g., `Disabled`, `Loading`) set to `true`.
- **Variants**: Generate a story for each value in the `variant` enum (e.g., `Primary`, `Secondary`).
- **Sizes**: Generate a story for each value in the `size` enum.

### 3. Example Automation

Given `kds-button` definition:

```json
{
  "properties": [
    {
      "name": "variant",
      "type": "enum",
      "allowedValues": ["primary", "secondary"]
    }
  ]
}
```

The generated Storybook code should be:

```typescript
export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };
```

## Playground Readiness

The documentation application currently implements a "Live Code Preview" playground. This validates that:

1. All properties are enumerable and controllable.
2. Data types are strict and map to UI controls.
3. The component API matches the contract exactly.
