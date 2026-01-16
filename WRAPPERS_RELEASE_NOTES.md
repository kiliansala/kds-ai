# Button Framework Wrappers v1.0.0 Release Notes

**Release Date:** January 16, 2026  
**Status:** ✅ STABLE  
**Parity:** Strict alignment with Button Web Component v1.0.0

---

## Overview

Button framework wrappers v1.0.0 are thin adapters for the canonical Button Web Component. They provide framework-idiomatic APIs while maintaining **100% strict parity** with the Web Component implementation.

**No framework-specific behavior, no prop aliases, no new features.** Only clean adapter patterns that map to the canonical Web Component API.

---

## Included Wrappers

| Framework | File | Status | Commits |
|-----------|------|--------|---------|
| React | `src/wrappers/react/KdsButton.tsx` | ✅ v1.0.0 | da4738b |
| Angular | `src/wrappers/angular/kds-button.component.ts` | ✅ v1.0.0 | d810fd9 |
| Blazor | `src/wrappers/blazor/KdsButton.razor` | ✅ v1.0.0 | 6929809 |

---

## API Specification (All Frameworks)

### Properties (7 inputs/parameters)

| Property | Type | Default | Notes |
|----------|------|---------|-------|
| `appearance` | `'filled' \| 'outlined' \| 'text' \| 'tonal' \| 'elevated'` | `'filled'` | Material Design 3 visual style |
| `state` | `'enabled' \| 'disabled' \| 'hovered' \| 'focused' \| 'pressed'` | `'enabled'` | Interaction state |
| `hasIcon` | `boolean` | `false` | Whether to show icon slot |
| `label` | `string` | `''` | Button text label |
| `icon` | `string` | `'add'` | Material Symbols icon name |
| `href` | `string \| null` | `null` | Optional URL; renders as link |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Form button type |

### Event (1 output/callback)

| Event | Type | Notes |
|-------|------|-------|
| `kds-click` | `CustomEvent<{originalEvent: PointerEvent}>` | Fires when button clicked; bubbles and composed |

### Slots (2 content areas)

| Slot | Usage | Notes |
|------|-------|-------|
| default | Button text content | Rendered as default content |
| icon | Custom icon | Use `slot="icon"` attribute in markup |

---

## Usage Examples

### React

```tsx
import KdsButton from './wrappers/react/KdsButton';

// Basic button
<KdsButton>Click Me</KdsButton>

// All 5 appearances
<KdsButton appearance="outlined">Outlined</KdsButton>
<KdsButton appearance="text">Text</KdsButton>
<KdsButton appearance="tonal">Tonal</KdsButton>
<KdsButton appearance="elevated">Elevated</KdsButton>

// Material Symbols icon
<KdsButton hasIcon={true} icon="add" appearance="filled">
  Add Item
</KdsButton>

// Custom icon slot (standard WC semantics)
<KdsButton appearance="tonal">
  <span slot="icon">🎨</span>
  Design
</KdsButton>

// Button states (5 variants)
<KdsButton state="enabled">Enabled</KdsButton>
<KdsButton state="disabled">Disabled</KdsButton>
<KdsButton state="hovered">Hovered</KdsButton>
<KdsButton state="focused">Focused</KdsButton>
<KdsButton state="pressed">Pressed</KdsButton>

// Form button types
<KdsButton type="submit" appearance="filled">Submit</KdsButton>
<KdsButton type="reset" appearance="outlined">Reset</KdsButton>

// Link button
<KdsButton href="https://example.com" appearance="filled">
  Go to Example
</KdsButton>

// Event handling
<KdsButton onKdsClick={(e) => console.log('clicked', e)}>
  Click Me
</KdsButton>

// All 7 properties
<KdsButton
  appearance="tonal"
  state="enabled"
  hasIcon={true}
  icon="check"
  label="Confirm"
  href="/confirm"
  type="submit"
  onKdsClick={(e) => handleClick(e)}>
  <span slot="icon">✓</span>
  Confirm
</KdsButton>
```

### Angular

```typescript
import { KdsButtonComponent } from './wrappers/angular/kds-button.component';

// Basic button
<kds-button-ng>Click Me</kds-button-ng>

// All 5 appearances
<kds-button-ng appearance="outlined">Outlined</kds-button-ng>
<kds-button-ng appearance="text">Text</kds-button-ng>
<kds-button-ng appearance="tonal">Tonal</kds-button-ng>
<kds-button-ng appearance="elevated">Elevated</kds-button-ng>

// Material Symbols icon
<kds-button-ng [hasIcon]="true" icon="add" appearance="filled">
  Add Item
</kds-button-ng>

// Custom icon slot (standard WC semantics)
<kds-button-ng appearance="tonal">
  <span slot="icon">🎨</span>
  Design
</kds-button-ng>

// Button states (5 variants)
<kds-button-ng state="enabled">Enabled</kds-button-ng>
<kds-button-ng state="disabled">Disabled</kds-button-ng>
<kds-button-ng state="hovered">Hovered</kds-button-ng>
<kds-button-ng state="focused">Focused</kds-button-ng>
<kds-button-ng state="pressed">Pressed</kds-button-ng>

// Form button types
<kds-button-ng type="submit" appearance="filled">Submit</kds-button-ng>
<kds-button-ng type="reset" appearance="outlined">Reset</kds-button-ng>

// Link button
<kds-button-ng href="https://example.com" appearance="filled">
  Go to Example
</kds-button-ng>

// Event handling
<kds-button-ng (kds-click)="onButtonClick($event)">
  Click Me
</kds-button-ng>

// Component class
onButtonClick(event: CustomEvent) {
  console.log('Button clicked!', event);
}

// All 7 properties
<kds-button-ng
  [appearance]="'tonal'"
  [state]="'enabled'"
  [hasIcon]="true"
  [icon]="'check'"
  [label]="'Confirm'"
  [href]="'/confirm'"
  [type]="'submit'"
  (kds-click)="handleClick($event)">
  <span slot="icon">✓</span>
  Confirm
</kds-button-ng>
```

### Blazor

```html
@using Microsoft.AspNetCore.Components
@using KdsAi.Wrappers

<!-- Basic button -->
<KdsButton>Click Me</KdsButton>

<!-- All 5 appearances -->
<KdsButton Appearance="outlined">Outlined</KdsButton>
<KdsButton Appearance="text">Text</KdsButton>
<KdsButton Appearance="tonal">Tonal</KdsButton>
<KdsButton Appearance="elevated">Elevated</KdsButton>

<!-- Material Symbols icon -->
<KdsButton HasIcon="true" Icon="add" Appearance="filled">
  Add Item
</KdsButton>

<!-- Custom icon slot (standard WC semantics) -->
<KdsButton Appearance="tonal">
  <span slot="icon">🎨</span>
  Design
</KdsButton>

<!-- Button states (5 variants) -->
<KdsButton State="enabled">Enabled</KdsButton>
<KdsButton State="disabled">Disabled</KdsButton>
<KdsButton State="hovered">Hovered</KdsButton>
<KdsButton State="focused">Focused</KdsButton>
<KdsButton State="pressed">Pressed</KdsButton>

<!-- Form button types -->
<KdsButton Type="submit" Appearance="filled">Submit</KdsButton>
<KdsButton Type="reset" Appearance="outlined">Reset</KdsButton>

<!-- Link button -->
<KdsButton Href="https://example.com" Appearance="filled">
  Go to Example
</KdsButton>

<!-- Event handling -->
<KdsButton OnKdsClick="HandleButtonClick">
  Click Me
</KdsButton>

@code {
    private void HandleButtonClick(CustomEventArgs e)
    {
        Console.WriteLine("Button clicked!");
    }
}

<!-- All 7 parameters -->
<KdsButton
    Appearance="@buttonAppearance"
    State="@(isDisabled ? "disabled" : "enabled")"
    HasIcon="true"
    Icon="check"
    Label="Confirm"
    Href="@navigateTo"
    Type="submit"
    OnKdsClick="@HandleClick">
  <span slot="icon">✓</span>
  Confirm
</KdsButton>
```

---

## Strict Parity Guarantee

All framework wrappers implement **exact parity** with the Button Web Component v1.0.0:

✅ **7 properties** — No aliases, no renamings  
✅ **1 event** — `kds-click` with CustomEvent payload  
✅ **2 slots** — Default (text) + icon (via `slot="icon"`)  
✅ **0 wrapper-only inputs** — No framework-specific props  

**Parity validates to 10/10 API elements for each framework.**

---

## Attribute Mapping Reference

| WC Property | React Prop | Angular Input | Blazor Parameter |
|-------------|-----------|---------------|------------------|
| `appearance` | `appearance` | `appearance` | `Appearance` |
| `state` | `state` | `state` | `State` |
| `hasIcon` → `has-icon` | `hasIcon` | `hasIcon` | `HasIcon` |
| `label` | `label` | `label` | `Label` |
| `icon` | `icon` | `icon` | `Icon` |
| `href` | `href` | `href` | `Href` |
| `type` | `type` | `type` | `Type` |
| `kds-click` | `onKdsClick` | `kds-click` | `OnKdsClick` |

---

## Slot Support Pattern

All frameworks support the standard Web Component slot pattern. To render a custom icon:

```html
<!-- Generic pattern (works in React, Angular, Blazor) -->
<button-element>
  <span slot="icon">ICON_CONTENT</span>
  BUTTON_TEXT
</button-element>
```

The `slot="icon"` attribute is a **standard HTML feature**, not a wrapper-specific API.

---

## Event Handling

The `kds-click` event fires when the button is clicked. The event payload is a `CustomEvent` with:
- `detail.originalEvent: PointerEvent` (the underlying pointer event)
- `bubbles: true`
- `composed: true`

### React
```tsx
<KdsButton onKdsClick={(e: CustomEvent) => {
  console.log('Original event:', e.detail?.originalEvent);
}}>
  Click
</KdsButton>
```

### Angular
```html
<kds-button-ng (kds-click)="onKdsClick($event)"></kds-button-ng>
```

### Blazor
```html
<KdsButton OnKdsClick="@HandleKdsClick"></KdsButton>

@code {
    private void HandleKdsClick(CustomEventArgs e) { }
}
```

---

## Version Alignment

| Component | Version | Release | Parity |
|-----------|---------|---------|--------|
| Button Web Component | v1.0.0 | button-v1.0.0 | Canonical |
| React Wrapper | v1.0.0 | button-wrappers-v1.0.0 | ✅ Exact |
| Angular Wrapper | v1.0.0 | button-wrappers-v1.0.0 | ✅ Exact |
| Blazor Wrapper | v1.0.0 | button-wrappers-v1.0.0 | ✅ Exact |

---

## Known Limitations

**None.** Wrappers are faithful adapters with no intentional limitations.

---

## Release Commits

- **React:** da4738b - `refactor: enforce STRICT API parity in React wrapper`
- **Angular:** d810fd9 - `docs(angular): enforce STRICT API parity documentation`
- **Blazor:** 6929809 - `refactor(blazor): enforce STRICT API parity in Button wrapper`

---

## Support & Maintenance

Wrappers are maintained in sync with the canonical Button Web Component. Framework-specific issues should be reported with clear reproduction steps.

**Principle:** Wrappers must always remain thin adapters with zero business logic or framework-specific behaviors.

---

## Verification Checklist

- ✅ React wrapper: 7 inputs, 1 event (onKdsClick), 2 slots
- ✅ Angular wrapper: 7 @Input, 1 @Output (kds-click), ng-content projection
- ✅ Blazor wrapper: 7 [Parameter], 1 [Parameter] event (OnKdsClick), @ChildContent
- ✅ Build passes: ✓ built in 271ms
- ✅ Zero wrapper-only APIs
- ✅ No Web Component modifications
- ✅ No token modifications

---

**Status:** 🟢 **Button Wrappers v1.0.0 — READY FOR PRODUCTION**

All wrappers are approved for stable use with strict parity guarantees to Button Web Component v1.0.0.
