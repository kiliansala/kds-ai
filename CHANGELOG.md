# Changelog

All notable changes to KDS-AI components are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Additional components (TextField, Checkbox, Radio, Switch, etc.)
- Dark mode support
- Extended accessibility enhancements
- Storybook integration (after token system stabilization)

---

## [1.0.0] - 2026-01-16

This release includes the Button Web Component v1.0.0 and framework wrappers with strict API parity.
See separate release tags below for component-specific releases.

### Added — Button Component v1.0

#### Component
- **`<kds-button>`** Web Component
  - **Appearances:** filled, outlined, text, tonal, elevated
  - **States:** enabled, disabled, hovered, focused, pressed
  - **Properties:** appearance, state, hasIcon, label, icon, href, type
  - **Events:** kds-click (with originalEvent detail)
  - **Slots:** default (text content), icon (custom icon)

#### Features
- Token-driven styling (Material Design 3 semantics)
- Full keyboard accessibility
- Focus indicators (WCAG AA compliant)
- Link button variant (href mode)
- Icon + text combinations
- Material Symbols icon support

#### Documentation
- Interactive playground with live code generation
- Visual matrix (25 variants × states combinations)
- 6 usage examples with live previews
- Framework integration guides (Web Component, React, Angular, Blazor)
- Design token references

#### Testing
- Comprehensive smoke test suite
- Accessibility validation
- Attribute reflection tests
- Event emission tests

#### Standards & Guarantees
- **API Stability:** Stable — breaking changes only in major versions
- **Accessibility:** WCAG 2.1 Level AA compliant
  - Tab navigation and keyboard activation
  - Clear focus indicators
  - aria-disabled semantics
  - Semantic HTML
- **Browser Support:** All modern browsers (ES2020+)
- **Token Dependency:** Design tokens v1.0 (required)

#### Known Limitations (Non-Blocking)
- Icon sizing is fixed at 18px (not configurable)
- Disabled outline button opacity reduction (could be more distinct)
- No loading state variant (not in scope)

#### Commits Included (Component)
- `003e460` - Visual matrix and dev-app playground
- `87832f1` - Visual state feedback improvements
- `d6c4d0a` - Test suite and usage documentation

#### Release Tag
- `button-v1.0.0` - Button Web Component stable release

---

### Added — Button Wrappers v1.0

#### Framework Wrappers (Strict Parity Release)
All framework wrappers released as stable v1.0.0 with **exact API parity** to Button Web Component v1.0.0.

**Included:**
- **React:** `src/wrappers/react/KdsButton.tsx` (commit: da4738b)
  - 7 props: appearance, state, hasIcon, label, icon, href, type
  - 1 event: onKdsClick (CustomEvent)
  - 2 slots: default (children), icon (slot="icon")
  
- **Angular:** `src/wrappers/angular/kds-button.component.ts` (commit: d810fd9)
  - 7 @Input: appearance, state, hasIcon, label, icon, href, type
  - 1 @Output: kds-click (CustomEvent)
  - 2 slots: ng-content projection for default + icon
  
- **Blazor:** `src/wrappers/blazor/KdsButton.razor` (commit: 6929809)
  - 7 [Parameter]: Appearance, State, HasIcon, Label, Icon, Href, Type
  - 1 [Parameter] event: OnKdsClick (CustomEventArgs)
  - 2 slots: @ChildContent for default + icon

#### Documentation
- `WRAPPERS_RELEASE_NOTES.md` with comprehensive API reference
- Usage examples for each framework
- Attribute mapping reference
- Slot support patterns
- Event handling examples

#### Parity Guarantee
✅ **10/10 API elements verified per wrapper**
- 7 properties (no aliases, no renamings)
- 1 event (kds-click with CustomEvent payload)
- 2 slots (default + icon via standard slot="icon")
- 0 wrapper-only inputs/parameters

#### Commits Included (Wrappers)
- `da4738b` - React: Enforce STRICT API parity
- `d810fd9` - Angular: Enforce STRICT API parity documentation
- `6929809` - Blazor: Enforce STRICT API parity
- `249fb01` - Release metadata: WRAPPERS_RELEASE_NOTES.md + CHANGELOG update

#### Release Tag
- `button-wrappers-v1.0.0` - Framework Wrappers stable release

#### Migration Notes
No migration needed. Initial stable release. All wrappers provide thin adapters with 100% parity to Web Component.

---

## Release Tags

| Tag | Purpose | Date |
|-----|---------|------|
| `button-v1.0.0` | Button Web Component v1.0.0 stable | 2026-01-16 |
| `button-wrappers-v1.0.0` | Framework Wrappers v1.0.0 stable | 2026-01-16 |

---

[Unreleased]: https://github.com/kiliansala/kds-ai/compare/button-wrappers-v1.0.0...HEAD
[1.0.0]: https://github.com/kiliansala/kds-ai/releases/tag/button-wrappers-v1.0.0
<!-- Global release reference. Component-specific tags listed above. -->
