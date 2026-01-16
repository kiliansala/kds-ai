/**
 * KdsButton React Wrapper - Usage Examples
 * 
 * Demonstrates strict API parity with Button Web Component v1.0.0
 * Exactly 7 properties, 1 event, and 2 slots - no wrapper-only props
 */

import React, { useRef } from 'react';
import KdsButton from './KdsButton';

// ============================================================
// EXAMPLE 1: Basic Button with Text Content (Default Slot)
// ============================================================
export function BasicButtonExample() {
  return (
    <div>
      <h3>Basic Button</h3>
      
      {/* Default filled appearance */}
      <KdsButton>
        Click Me
      </KdsButton>
      
      {/* All 5 appearances (WC API) */}
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
// EXAMPLE 2: Button with Material Symbols Icon
// ============================================================
export function ButtonWithMaterialIconExample() {
  return (
    <div>
      <h3>Button with Material Symbols Icon</h3>
      
      {/* When hasIcon=true, icon property specifies which Material Symbols to show */}
      <KdsButton
        hasIcon={true}
        icon="add"
        appearance="filled"
      >
        Add Item
      </KdsButton>
      
      {/* Icon-only button (no default slot content) */}
      <KdsButton
        hasIcon={true}
        icon="delete"
        appearance="outlined"
      />
      
      {/* Different icons */}
      <KdsButton hasIcon={true} icon="check" appearance="tonal">
        Done
      </KdsButton>
      
      <KdsButton hasIcon={true} icon="settings" appearance="elevated">
        Settings
      </KdsButton>
    </div>
  );
}

// ============================================================
// EXAMPLE 3: Button with Custom Icon Slot Content
// ============================================================
export function ButtonWithCustomIconSlotExample() {
  return (
    <div>
      <h3>Button with Custom Icon Slot</h3>
      
      {/* Use standard Web Component slot semantics: slot="icon" */}
      {/* This overrides the Material Symbols icon from the icon property */}
      <KdsButton appearance="tonal">
        <span slot="icon">🎨</span>
        Design
      </KdsButton>
      
      {/* SVG icon via slot */}
      <KdsButton appearance="filled">
        <svg slot="icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        Done
      </KdsButton>
      
      {/* Custom component as icon */}
      <KdsButton appearance="outlined">
        <span slot="icon" style={{fontSize: '20px'}}>⭐</span>
        Favorite
      </KdsButton>
    </div>
  );
}

// ============================================================
// EXAMPLE 4: Button States (5 State Variants)
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
// EXAMPLE 5: Form Button Types (type Property)
// ============================================================
export function FormButtonsExample() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Form Buttons (type Property)</h3>
      
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
// EXAMPLE 6: Link Button (href Property)
// ============================================================
export function LinkButtonExample() {
  return (
    <div>
      <h3>Link Button (href Property)</h3>
      
      {/* When href is provided, the WC renders as <a> tag internally */}
      {/* This is semantic HTML and works with keyboard navigation */}
      <KdsButton href="https://example.com" appearance="filled">
        Go to Example
      </KdsButton>
      
      <KdsButton href="/docs" appearance="text">
        Read Documentation
      </KdsButton>
      
      {/* Link with Material Symbols icon */}
      <KdsButton
        href="/settings"
        hasIcon={true}
        icon="settings"
        appearance="tonal"
      >
        Settings
      </KdsButton>
      
      {/* Link with custom icon slot */}
      <KdsButton href="/help" appearance="outlined">
        <span slot="icon">❓</span>
        Help
      </KdsButton>
    </div>
  );
}

// ============================================================
// EXAMPLE 7: Event Handling (kds-click Event)
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
      <h3>Event Handling (onKdsClick)</h3>
      
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
// EXAMPLE 8: Ref Forwarding
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
// EXAMPLE 9: Complex Example with All 7 Properties
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
      <h3>Complex Example (All 7 Properties)</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          <input
            type="checkbox"
            checked={disabled}
            onChange={(e) => setDisabled(e.target.checked)}
          />
          Disabled (state property)
        </label>
        
        <label>
          <input
            type="checkbox"
            checked={hasIcon}
            onChange={(e) => setHasIcon(e.target.checked)}
          />
          Show Icon (hasIcon property)
        </label>
        
        <select value={appearance} onChange={(e) => setAppearance(e.target.value as any)}>
          <option value="filled">Filled</option>
          <option value="outlined">Outlined</option>
          <option value="text">Text</option>
          <option value="tonal">Tonal</option>
          <option value="elevated">Elevated</option>
        </select>
      </div>
      
      {/* Button with all 7 WC properties configured */}
      <KdsButton
        appearance={appearance}
        state={disabled ? 'disabled' : 'enabled'}
        hasIcon={hasIcon}
        icon="check"
        label="Confirm"
        type="button"
        onKdsClick={handleKdsClick}
      >
        {hasIcon && <span slot="icon">✓</span>}
        Dynamic Button
      </KdsButton>
    </div>
  );
}

// ============================================================
// EXAMPLE 10: Accessibility with Standard HTML Attributes
// ============================================================
export function AccessibilityExample() {
  return (
    <div>
      <h3>Accessibility Features</h3>
      
      {/* Disabled state is marked automatically with aria-disabled by WC */}
      <KdsButton state="disabled" title="Save document (currently disabled)">
        Save
      </KdsButton>
      
      {/* Standard HTML title attribute */}
      <KdsButton appearance="outlined" title="Delete the selected item">
        Delete
      </KdsButton>
      
      {/* Icon-only button with title for context */}
      <KdsButton
        hasIcon={true}
        icon="info"
        title="Show more information"
      />
      
      {/* Link button with title */}
      <KdsButton
        href="/help"
        hasIcon={true}
        icon="help"
        title="Open help documentation"
      >
        Help
      </KdsButton>
    </div>
  );
}

// ============================================================
// API Parity Reference (7 Properties, 1 Event, 2 Slots)
// ============================================================
/**
 * STRICT PARITY WITH WEB COMPONENT v1.0.0
 * 
 * React Wrapper Props (exactly 7 WC properties):
 * ─────────────────────────────────────────────
 * 1. appearance:  'filled' | 'outlined' | 'text' | 'tonal' | 'elevated'
 * 2. state:       'enabled' | 'disabled' | 'hovered' | 'focused' | 'pressed'
 * 3. hasIcon:     boolean
 * 4. label:       string
 * 5. icon:        string (Material Symbols name)
 * 6. href:        string (optional, makes button render as <a>)
 * 7. type:        'button' | 'submit' | 'reset'
 * 
 * Event Handler:
 * ──────────────
 * onKdsClick:     (e: CustomEvent) => void
 * 
 * Slots (standard Web Component semantics):
 * ─────────────────────────────────────────
 * 1. default slot:   children (button text content)
 * 2. icon slot:      <span slot="icon">...</span> (custom icon)
 *
 * NO WRAPPER-ONLY PROPS (removed: iconSlot)
 * 
 * ✓ 7 properties + 1 event + 2 slots = 10/10 API parity
 */
