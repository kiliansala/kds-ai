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

### Added - Button Component v1.0

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

### Standards & Guarantees
- **API Stability:** Stable - no breaking changes expected
- **Accessibility:** WCAG 2.1 Level AA compliant
  - Tab navigation and keyboard activation
  - Clear focus indicators
  - aria-disabled semantics
  - Semantic HTML
- **Browser Support:** All modern browsers (ES2020+)
- **Token Dependency:** Design tokens v1.0 (required)

### Known Limitations (Non-Blocking)
- Icon sizing is fixed at 18px (not configurable)
- Disabled outline button opacity reduction (could be more distinct)
- No loading state variant (not in scope)

### Commits Included
- `003e460` - Visual matrix and dev-app playground
- `87832f1` - Visual state feedback improvements
- `d6c4d0a` - Test suite and usage documentation

### Migration Notes
No migration needed. Initial stable release.

---

[Unreleased]: https://github.com/kiliansala/kds-ai/compare/button-v1.0.0...HEAD
[1.0.0]: https://github.com/kiliansala/kds-ai/releases/tag/button-v1.0.0
