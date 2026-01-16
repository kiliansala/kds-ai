/**
 * KdsButton React Wrapper - Usage Examples
 * 
 * Demonstrates full API parity with Button Web Component v1.0.0
 * All 7 properties, 1 event, and 2 slots are fully supported
 */

import React, { useRef } from 'react';
import KdsButton from './KdsButton';

// ============================================================
// EXAMPLE 1: Basic Button with Text Content
// ============================================================
export function BasicButtonExample() {
  return (
    <div>
      <h3>Basic Button</h3>
      
      {/* Default filled appearance */}
      <KdsButton>
        Click Me
      </KdsButton>
      
      {/* All appearances */}
      <KdsButton appearance="outlined">
        Outlined
      </KdsButton>
      
      <KdsButton appearance="text">
        Text
      </KdsButton>
      
      <KdsButton appearance="tonal">
        Tonal
      </KdsButton>
      
      <KdsButton appearance="elevated">
        Elevated
      </KdsButton>
    </div>
  );
}

// ============================================================
// EXAMPLE 2: Button with Icon Support
// ============================================================
export function ButtonWithIconExample() {
  return (
    <div>
      <h3>Button with Icon</h3>
      
      {/* Material Symbols icon with hasIcon + icon properties */}
      {/* When hasIcon=true, the button shows the icon in a special icon slot */}
      {/* The 'icon' property specifies which Material Symbols icon to display */}
      <KdsButton
        hasIcon={true}
        icon="add"
        appearance="filled"
      >
        Add Item
      </KdsButton>
      
      {/* Icon-only button */}
      <KdsButton
        hasIcon={true}
        icon="delete"
        appearance="outlined"
      />
      
      {/* Custom icon via iconSlot JSX */}
      {/* This overrides the Material Symbols icon */}
      <KdsButton
        appearance="tonal"
        iconSlot={<span>🎨</span>}
      >
        Custom Icon
      </KdsButton>
      
      {/* Custom SVG icon via iconSlot */}
      <KdsButton
        iconSlot={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        }
      >
        Done
      </KdsButton>
    </div>
  );
}

// ============================================================
// EXAMPLE 3: Button States
// ============================================================
export function ButtonStatesExample() {
  return (
    <div>
      <h3>Button States</h3>
      
      {/* Default enabled state */}
      <KdsButton state="enabled">
        Enabled
      </KdsButton>
      
      {/* Disabled state */}
      <KdsButton state="disabled">
        Disabled
      </KdsButton>
      
      {/* Hovered state (manually set for demo) */}
      <KdsButton state="hovered">
        Hovered
      </KdsButton>
      
      {/* Focused state */}
      <KdsButton state="focused">
        Focused
      </KdsButton>
      
      {/* Pressed state */}
      <KdsButton state="pressed">
        Pressed
      </KdsButton>
    </div>
  );
}

// ============================================================
// EXAMPLE 4: Button Types (form submission)
// ============================================================
export function FormButtonsExample() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Form Buttons</h3>
      
      {/* type="button" - default, no form interaction */}
      <KdsButton type="button">
        Regular Button
      </KdsButton>
      
      {/* type="submit" - submits the form */}
      <KdsButton type="submit" appearance="filled">
        Submit
      </KdsButton>
      
      {/* type="reset" - resets form fields */}
      <KdsButton type="reset" appearance="outlined">
        Reset
      </KdsButton>
    </form>
  );
}

// ============================================================
// EXAMPLE 5: Link Button via href
// ============================================================
export function LinkButtonExample() {
  return (
    <div>
      <h3>Link Button</h3>
      
      {/* When href is provided, the button becomes an <a> tag internally */}
      {/* This is semantic HTML and works with keyboard navigation */}
      <KdsButton href="https://example.com" appearance="filled">
        Go to Example
      </KdsButton>
      
      <KdsButton href="/docs" appearance="text">
        Read Documentation
      </KdsButton>
      
      {/* Link with icon */}
      <KdsButton
        href="/settings"
        hasIcon={true}
        icon="settings"
        appearance="tonal"
      >
        Settings
      </KdsButton>
    </div>
  );
}

// ============================================================
// EXAMPLE 6: Event Handling (kds-click Event)
// ============================================================
export function EventHandlingExample() {
  const [clickCount, setClickCount] = React.useState(0);

  const handleKdsClick = (e: CustomEvent) => {
    console.log('kds-click event fired:', e);
    console.log('Original event:', e.detail?.originalEvent);
    setClickCount(prev => prev + 1);
  };

  return (
    <div>
      <h3>Event Handling</h3>
      
      <KdsButton
        onKdsClick={handleKdsClick}
        appearance="filled"
      >
        Click Me (Count: {clickCount})
      </KdsButton>
      
      {/* The kds-click event bubbles and is composed */}
      {/* So you can listen on parent elements too */}
    </div>
  );
}

// ============================================================
// EXAMPLE 7: Ref Forwarding
// ============================================================
export function RefForwardingExample() {
  const buttonRef = useRef<HTMLElement>(null);

  const focusButton = () => {
    buttonRef.current?.focus();
  };

  const getButtonElement = () => {
    console.log('Button element:', buttonRef.current);
    console.log('Tag name:', buttonRef.current?.tagName);
  };

  return (
    <div>
      <h3>Ref Forwarding</h3>
      
      {/* You can get a ref to the underlying <kds-button> Web Component */}
      <KdsButton
        ref={buttonRef}
        appearance="filled"
      >
        I have a ref
      </KdsButton>
      
      <button onClick={focusButton}>
        Focus Button
      </button>
      
      <button onClick={getButtonElement}>
        Log Button Element
      </button>
    </div>
  );
}

// ============================================================
// EXAMPLE 8: Complex Button with All Features
// ============================================================
export function ComplexButtonExample() {
  const [disabled, setDisabled] = React.useState(false);
  const [appearance, setAppearance] = React.useState<'filled' | 'outlined' | 'text' | 'tonal' | 'elevated'>('filled');
  const [hasIcon, setHasIcon] = React.useState(true);

  const handleKdsClick = (e: CustomEvent) => {
    console.log('Button clicked!', e);
  };

  return (
    <div>
      <h3>Complex Button Example</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          <input
            type="checkbox"
            checked={disabled}
            onChange={(e) => setDisabled(e.target.checked)}
          />
          Disabled
        </label>
        
        <label>
          <input
            type="checkbox"
            checked={hasIcon}
            onChange={(e) => setHasIcon(e.target.checked)}
          />
          Show Icon
        </label>
        
        <select value={appearance} onChange={(e) => setAppearance(e.target.value as any)}>
          <option value="filled">Filled</option>
          <option value="outlined">Outlined</option>
          <option value="text">Text</option>
          <option value="tonal">Tonal</option>
          <option value="elevated">Elevated</option>
        </select>
      </div>
      
      {/* Button with all configurable properties */}
      <KdsButton
        appearance={appearance}
        state={disabled ? 'disabled' : 'enabled'}
        hasIcon={hasIcon}
        icon="check"
        label="Dynamic Button"
        type="button"
        onKdsClick={handleKdsClick}
      >
        {hasIcon ? 'Confirmed' : 'Click'}
      </KdsButton>
    </div>
  );
}

// ============================================================
// EXAMPLE 9: Accessibility Features
// ============================================================
export function AccessibilityExample() {
  return (
    <div>
      <h3>Accessibility Features</h3>
      
      {/* Disabled buttons are properly marked with aria-disabled */}
      <KdsButton state="disabled" aria-label="Save document (currently disabled)">
        Save
      </KdsButton>
      
      {/* Buttons support aria-label for custom labels */}
      <KdsButton aria-label="Delete the selected item" appearance="outlined">
        Delete
      </KdsButton>
      
      {/* Icon buttons should have aria-label to describe their purpose */}
      <KdsButton
        hasIcon={true}
        icon="info"
        aria-label="Show more information"
      />
      
      {/* Links with href support keyboard navigation */}
      <KdsButton
        href="/help"
        hasIcon={true}
        icon="help"
        aria-label="Open help documentation"
      >
        Help
      </KdsButton>
    </div>
  );
}

// ============================================================
// EXAMPLE 10: Properties Mapping (WC → React)
// ============================================================
/**
 * API Parity Reference - How WC properties map to React props:
 * 
 * Web Component Property  →  React Prop          →  Type
 * ────────────────────────────────────────────────────────
 * appearance              →  appearance          →  'filled' | 'outlined' | 'text' | 'tonal' | 'elevated'
 * state                   →  state               →  'enabled' | 'disabled' | 'hovered' | 'focused' | 'pressed'
 * hasIcon                 →  hasIcon             →  boolean
 * label                   →  label               →  string
 * icon                    →  icon                →  string (Material Symbols icon name)
 * href                    →  href                →  string (makes button render as <a> tag)
 * type                    →  type                →  'button' | 'submit' | 'reset'
 * [custom event]          →  onKdsClick          →  (e: CustomEvent) => void
 * [default slot]          →  children            →  ReactNode (button text)
 * [icon slot]             →  iconSlot            →  ReactNode (custom icon override)
 * 
 * All 7 properties + 1 event + 2 slots = 10/10 API parity ✓
 */
