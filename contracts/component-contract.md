# KDS Component Contract v0.1

## Global Rules

- **Naming**: All components use the `kds-` prefix (e.g., `kds-button`). Property names are camelCase. Attribute names are kebab-case.
- **HTML-First**: Attributes must be serializable types (string, number, boolean). Complex data is passed via properties.
- **Strict API**: Only properties defined here are exposed. No "catch-all" attributes.
- **Accessibility**: All components must reflect ARIA states corresponding to their internal state.

## Shared Concepts

### Common States

These states apply to most interactive components:

- `disabled`: User cannot interact.
- `readonly`: User can select but not change value.
- `invalid`: Data does not match requirements.
- `loading`: Operation in progress.
- `focused`: Element has focus.

### Common Sizes

- `sm`: Small / dense.
- `md`: Medium / default.
- `lg`: Large.

### Common Variants

- `primary`: Main action.
- `secondary`: Alternative action.
- `tertiary`: Low emphasis / ghost.
- `danger`: Destructive action.

---

## Component Definitions

### Button

- **Tag**: `kds-button`
- **Description**: Trigger an action or navigation. NOT used for toggle states.
- **Properties**:
  - `label` (string, default: ""): Text content.
  - `variant` (enum: primary, secondary, tertiary, danger, default: primary): Visual style.
  - `size` (enum: sm, md, lg, default: md): Size.
  - `icon` (string | undefined): Optional icon name.
  - `iconPosition` (enum: start, end, default: start): formatting.
  - `type` (enum: button, submit, reset, default: button): Form behavior.
  - `disabled` (boolean, default: false).
  - `loading` (boolean, default: false).
  - `href` (string | undefined): If present, behaves as a link.
- **Events**:
  - `kds-click`: Standard click (preventable).
- **Slots**:
  - `default`: Content (replaces label property if used).
  - `icon`: Custom icon definition.

### TextField

- **Tag**: `kds-text-field`
- **Description**: Single-line text input.
- **Properties**:
  - `value` (string, default: "").
  - `label` (string, default: ""): Visible label.
  - `placeholder` (string, default: "").
  - `helperText` (string, default: "").
  - `errorText` (string, default: ""): If present, triggers invalid state.
  - `disabled` (boolean, default: false).
  - `readonly` (boolean, default: false).
  - `type` (enum: text, password, email, number, tel, url, default: text).
  - `required` (boolean, default: false).
- **Events**:
  - `kds-input`: Value changed. Payload: `{ value: string }`.
  - `kds-change`: Value committed. Payload: `{ value: string }`.
  - `kds-focus`: Focused.
  - `kds-blur`: Blurred.
- **Slots**:
  - `start-adornment`: Icon/content before text.
  - `end-adornment`: Icon/content after text.

### Checkbox

- **Tag**: `kds-checkbox`
- **Description**: Binary selection input.
- **Properties**:
  - `checked` (boolean, default: false).
  - `indeterminate` (boolean, default: false): Mixed state.
  - `label` (string, default: "").
  - `disabled` (boolean, default: false).
  - `required` (boolean, default: false).
  - `value` (string, default: "on"): Form value.
- **Events**:
  - `kds-change`: State changed. Payload: `{ checked: boolean }`.

### Radio

- **Tag**: `kds-radio`
- **Description**: Single selection from a set.
- **Properties**:
  - `checked` (boolean, default: false).
  - `value` (string, required): Unique value in group.
  - `label` (string, default: "").
  - `disabled` (boolean, default: false).
  - `name` (string): Group name.
- **Events**:
  - `kds-change`: Selected. Payload: `{ checked: boolean, value: string }`.

### Switch

- **Tag**: `kds-switch`
- **Description**: Immediate toggle setting.
- **Properties**:
  - `checked` (boolean, default: false).
  - `label` (string, default: "").
  - `disabled` (boolean, default: false).
  - `size` (enum: sm, md, default: md).
- **Events**:
  - `kds-change`: Toggled. Payload: `{ checked: boolean }`.

### Select

- **Tag**: `kds-select`
- **Description**: Selection from a predefined list.
- **Properties**:
  - `value` (string, default: "").
  - `label` (string, default: "").
  - `placeholder` (string, default: "").
  - `options` (array, default: []): List of `{ label: string, value: string }` objects? _Note: Web Components attributes usually rely on JSON or child elements. Design decision: Use child `kds-option` elements OR a serializable options array. Supporting child elements is more HTML-idiomatic._
  - Decision: Use Properties for data-driven, Slots for declarative.
  - `disabled` (boolean, default: false).
  - `multiple` (boolean, default: false).
- **Slots**:
  - `default`: Expects `kds-option` elements.
- **Events**:
  - `kds-change`: Selection changed. Payload: `{ value: string | string[] }`.

### TextArea

- **Tag**: `kds-textarea`
- **Description**: Multi-line text input.
- **Properties**:
  - `value` (string, default: "").
  - `label` (string, default: "").
  - `placeholder` (string, default: "").
  - `rows` (number, default: 3).
  - `maxRows` (number): Autosize limit.
  - `resize` (enum: none, vertical, auto, default: vertical).
  - `disabled` (boolean).
  - `readonly` (boolean).
  - `errorText` (string).
- **Events**:
  - `kds-input`: Value changed.
  - `kds-change`: Committed.

### Badge

- **Tag**: `kds-badge`
- **Description**: Status indicator or count.
- **Properties**:
  - `content` (string | number): Text/Number to display.
  - `variant` (enum: primary, secondary, success, warning, danger, neutral, default: primary).
  - `size` (enum: sm, md, default: md).
  - `dot` (boolean, default: false): If true, ignores content and shows a dot.
- **Slots**:
  - `default`: Wraps this content (badge overlay).

### Icon

- **Tag**: `kds-icon`
- **Description**: Visual symbol.
- **Properties**:
  - `name` (string, required): Token name of the icon.
  - `size` (enum: sm, md, lg, xl, default: md).
  - `color` (string): Token color reference (optional override).
  - `label` (string): ARIA label (if interactive/semantic).

### Tooltip

- **Tag**: `kds-tooltip`
- **Description**: Contextual help info on hover/focus.
- **Properties**:
  - `content` (string, default: "").
  - `position` (enum: top, right, bottom, left, default: top).
  - `disabled` (boolean).
- **Slots**:
  - `default`: The trigger element.

### Dialog

- **Tag**: `kds-dialog`
- **Description**: Modal window.
- **Properties**:
  - `open` (boolean, default: false).
  - `title` (string).
  - `size` (enum: sm, md, lg, fullscreen, default: md).
  - `dismissible` (boolean, default: true): Close on click outside/escape.
- **Events**:
  - `kds-close`: Request to close.
- **Slots**:
  - `default`: Body content.
  - `header-actions`: Top right actions.
  - `footer`: Action buttons (Cancel, OK).
