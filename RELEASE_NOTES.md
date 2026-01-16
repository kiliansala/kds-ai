# Button v1.0.0 Release Notes

**Release Date:** 2026-01-16  
**Component:** `<kds-button>` Web Component  
**Status:** ✅ Stable v1.0

---

## Overview

The KDS-AI Button component is now released as **stable v1.0** with a frozen API and full accessibility support. This is the reference implementation for all framework wrappers (React, Angular, Blazor).

---

## What's Included

### Core Component
- **Tag:** `<kds-button>`
- **Type:** Web Component (Custom Element)
- **Location:** [src/components/kds-button.ts](src/components/kds-button.ts)

### API Surface (Stable)

#### Properties
| Property | Type | Default | Notes |
|----------|------|---------|-------|
| `appearance` | enum | `filled` | filled, outlined, text, tonal, elevated |
| `state` | enum | `enabled` | enabled, disabled, hovered, focused, pressed |
| `hasIcon` | boolean | `false` | Show/hide icon |
| `label` | string | `""` | Button text content |
| `icon` | string | `"add"` | Material Symbol name |
| `href` | string | (optional) | Convert to link button |
| `type` | string | `"button"` | HTML button type (submit, reset, button) |

#### Events
| Event | Payload | Notes |
|-------|---------|-------|
| `kds-click` | `{ originalEvent: PointerEvent }` | Fires on click; prevented if disabled |

#### Slots
| Slot | Purpose |
|------|---------|
| `default` | Text content (overrides label property) |
| `icon` | Custom icon (overrides icon property) |

### Visual Specifications
- **Size:** 40px height (MD size, not configurable in v1.0)
- **Border Radius:** 100px (pill-shaped)
- **Typography:** label-large (500 weight, 14px)
- **States Feedback:**
  - Hover: 0.08 opacity overlay
  - Focus: 2px outline + 0.12 opacity overlay
  - Pressed: 0.16 opacity overlay
  - Disabled: 50% opacity, no interaction

### Design Tokens (Required)
The component is token-driven and requires these tokens to be available:
- `--kds-components.components.primary.light`
- `--kds-components.components.on-primary.light`
- `--kds-components.components.secondary-container.light`
- `--kds-components.components.on-secondary-container.light`
- `--kds-components.components.surface-container-low.light`
- `--kds-components.components.on-surface-variant.light`
- `--kds-components.components.outline-variant.light`

See [component-definitions.json](contracts/component-definitions.json) for full token list.

---

## Accessibility

✅ **WCAG 2.1 Level AA Compliant**

### Features
- **Keyboard Navigation:**
  - Tab focus for all interactive states
  - Enter/Space activation
  - Disabled state prevents focus (`disabled` attribute or `tabindex="-1"`)

- **Focus Indicators:**
  - 2px solid outline, 2px offset
  - Visible on all backgrounds
  - Applied on `:focus-visible` and `.kds-btn--focused` class

- **Semantics:**
  - Native `<button>` element for button mode
  - `<a role="button">` for link mode (when `href` present)
  - `aria-disabled="true"` when disabled

- **Visual Feedback:**
  - All states provide clear interaction feedback
  - Disabled state has reduced opacity
  - Color contrast ratios meet WCAG AA standards

### Testing
Accessibility validated via:
- Manual keyboard navigation testing
- Focus indicator visibility assessment
- Semantic HTML correctness
- ARIA attribute usage

---

## Documentation & Examples

### Dev-App
Interactive playground available at:  
`http://localhost:5174/kds-ai/?component=kds-button`

### Features
- **Interactive Controls:** Adjust all properties live
- **Visual Matrix:** All 25 variants × states displayed
- **Usage Examples:** 6 common patterns with code
- **Framework Integration:** Code snippets for React, Angular, Blazor
- **Token Inspector:** View actual token values

### Usage Examples

#### Basic Button
```html
<kds-button label="Click me" appearance="filled"></kds-button>
```

#### Button with Icon
```html
<kds-button label="Search" appearance="filled" has-icon icon="search"></kds-button>
```

#### Outlined Variant
```html
<kds-button label="Cancel" appearance="outlined"></kds-button>
```

#### Text Variant
```html
<kds-button label="Learn more" appearance="text"></kds-button>
```

#### Disabled State
```html
<kds-button label="Save" appearance="filled" state="disabled"></kds-button>
```

#### Link Button
```html
<kds-button label="Visit site" appearance="outlined" href="https://example.com"></kds-button>
```

---

## Testing

### Smoke Tests
Comprehensive test suite available at:  
[src/components/kds-button.test.ts](src/components/kds-button.test.ts)

Run tests in browser:
```javascript
// In browser console after loading dev-app
window.kdsButtonTests()
```

### Tests Included
- ✅ Render test (default properties)
- ✅ Disabled behavior validation
- ✅ Attribute/property reflection
- ✅ Event emission (kds-click)
- ✅ All 5 appearances render
- ✅ All 5 states render

### Build Validation
- ✅ TypeScript compilation succeeds
- ✅ Contract validation passes
- ✅ No console errors

---

## Stability Guarantees

### What's Stable (v1.0)
- ✅ Public API (properties, events, slots)
- ✅ Visual design (all appearances × states)
- ✅ Accessibility behavior
- ✅ Event contracts

### What's Not Stable
- Internal implementation details (private methods, styling internals)
- Shadow DOM structure (may change without notice)

### Breaking Change Policy
- **Minor:** New non-breaking props or variants
- **Major:** Only for critical accessibility or security fixes

---

## Known Limitations (Non-Blocking)

### Would Be Nice (v1.1+)
1. **Icon sizing** — Currently fixed at 18px
   - Could be configurable in future
   - Material Symbol standard is 18–48px range

2. **Outlined button disabled state** — Opacity reduction only
   - Could have more distinct border color change
   - Current implementation sufficient per spec

3. **Loading state** — Not in scope for v1.0
   - Can be added as new appearance variant

These items do **not** block v1.0 release and do **not** require API changes.

---

## Commits in This Release

| Commit | Message |
|--------|---------|
| `003e460` | feat(button): add visual matrix and dev-app playground |
| `87832f1` | fix(button): improve visual state feedback across all appearances |
| `d6c4d0a` | feat(button): add RC-ready test suite and usage documentation |

---

## Installation & Usage

### Import
```typescript
import './components/kds-button';
```

### Register (if needed)
The component auto-registers via the module. No additional setup required.

### Basic Usage
```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="path/to/tokens.css">
  </head>
  <body>
    <kds-button 
      label="Click me" 
      appearance="filled"
      (kds-click)="handleClick($event)">
    </kds-button>

    <script type="module" src="path/to/kds-button.js"></script>
  </body>
</html>
```

---

## Support & Feedback

- **Issues:** File in GitHub issues
- **Questions:** See dev-app documentation
- **Accessibility Concerns:** Priority support

---

## Release Checklist

- ✅ API frozen and documented
- ✅ All tests passing
- ✅ Accessibility validated
- ✅ Documentation complete
- ✅ Visual design locked
- ✅ Framework wrappers updated
- ✅ Changelog created
- ✅ Release notes published
- ✅ Git tag prepared: `button-v1.0.0`

---

**Status:** 🎉 Ready for Production  
**Stability:** Stable v1.0  
**Next:** Framework wrapper releases (React v1.0, Angular v1.0, etc.)
