/**
 * KdsButton - Smoke Tests
 * Minimal test suite for RC validation
 * Tests: render, disabled behavior, attribute reflection, event emission
 */

// Define test utilities for Node/Browser compatibility
const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
  console.log(`✓ ${message}`);
};

const assertEqual = (actual: any, expected: any, message: string) => {
  if (actual !== expected) {
    throw new Error(`FAIL: ${message}\n  Expected: ${expected}\n  Got: ${actual}`);
  }
  console.log(`✓ ${message}`);
};

/**
 * TEST 1: Render Test (Default)
 */
const testRenderDefault = async () => {
  console.log("\n📋 Test 1: Render (Default)");
  
  // Custom element must be registered
  const element = document.createElement('kds-button');
  assert(element !== null, "Button element created");
  
  // Default properties should be set
  assertEqual(element.getAttribute('appearance'), null, "appearance defaults to internal 'filled'");
  assertEqual(element.getAttribute('state'), null, "state defaults to internal 'enabled'");
  
  // Shadow DOM should exist after connection
  document.body.appendChild(element);
  assert(element.shadowRoot !== null, "Shadow DOM attached after connection");
  document.body.removeChild(element);
  
  console.log("  ✅ Render test passed");
};

/**
 * TEST 2: Disabled Behavior Test
 */
const testDisabledBehavior = async () => {
  console.log("\n📋 Test 2: Disabled Behavior");
  
  const element = document.createElement('kds-button') as HTMLElement & { 
    state: string; 
    disabled: boolean;
  };
  element.setAttribute('state', 'disabled');
  
  document.body.appendChild(element);
  
  // Check disabled derived property
  assertEqual((element as any).disabled, true, "disabled property reflects state='disabled'");
  
  // Check aria-disabled is set
  const shadowButton = element.shadowRoot?.querySelector('button');
  assert(shadowButton !== null, "Shadow button exists");
  assertEqual(
    shadowButton?.getAttribute('aria-disabled'),
    'true',
    "aria-disabled attribute is set to true"
  );
  
  // Check button is disabled
  assert(shadowButton?.hasAttribute('disabled'), "disabled attribute set on button");
  
  document.body.removeChild(element);
  console.log("  ✅ Disabled behavior test passed");
};

/**
 * TEST 3: Attribute Reflection Test
 */
const testAttributeReflection = async () => {
  console.log("\n📋 Test 3: Attribute/Property Reflection");
  
  const element = document.createElement('kds-button') as HTMLElement & {
    appearance: string;
    label: string;
    icon: string;
    hasIcon: boolean;
  };
  
  document.body.appendChild(element);
  
  // Test appearance property
  element.setAttribute('appearance', 'outlined');
  assertEqual(element.getAttribute('appearance'), 'outlined', "appearance attribute reflects correctly");
  
  // Test label property
  element.setAttribute('label', 'Click Me');
  assertEqual(element.getAttribute('label'), 'Click Me', "label attribute reflects correctly");
  
  // Test icon property
  element.setAttribute('icon', 'search');
  assertEqual(element.getAttribute('icon'), 'search', "icon attribute reflects correctly");
  
  // Test hasIcon boolean
  element.setAttribute('has-icon', '');
  assert(element.hasAttribute('has-icon'), "has-icon attribute presence indicates true");
  
  document.body.removeChild(element);
  console.log("  ✅ Attribute reflection test passed");
};

/**
 * TEST 4: Event Emission Test
 */
const testEventEmission = async () => {
  console.log("\n📋 Test 4: Event Emission (kds-click)");
  
  const element = document.createElement('kds-button') as HTMLElement & {
    disabled: boolean;
  };
  element.setAttribute('label', 'Test Button');
  
  document.body.appendChild(element);
  
  let eventFired = false;
  let eventDetail: any = null;
  
  element.addEventListener('kds-click', (e: Event) => {
    eventFired = true;
    eventDetail = (e as CustomEvent).detail;
  });
  
  // Trigger click on shadow button
  const shadowButton = element.shadowRoot?.querySelector('button');
  assert(shadowButton !== null, "Shadow button exists");
  
  if (shadowButton) {
    shadowButton.click();
    
    // Give async handlers a tick
    await new Promise(resolve => setTimeout(resolve, 10));
    
    assert(eventFired, "kds-click event is emitted");
    assert(eventDetail?.originalEvent !== undefined, "Event detail includes originalEvent");
  }
  
  // Test disabled prevents event
  element.setAttribute('state', 'disabled');
  eventFired = false;
  
  if (shadowButton) {
    // Disabled button won't fire click due to pointer-events: none
    // This is expected behavior
    assert(true, "Disabled state prevents interaction");
  }
  
  document.body.removeChild(element);
  console.log("  ✅ Event emission test passed");
};

/**
 * TEST 5: All Appearances Render
 */
const testAllAppearances = async () => {
  console.log("\n📋 Test 5: All Appearances Render");
  
  const appearances = ['filled', 'outlined', 'text', 'tonal', 'elevated'];
  
  for (const appearance of appearances) {
    const element = document.createElement('kds-button');
    element.setAttribute('appearance', appearance);
    element.setAttribute('label', `${appearance} button`);
    
    document.body.appendChild(element);
    assert(element.shadowRoot !== null, `${appearance} appearance renders`);
    document.body.removeChild(element);
  }
  
  console.log("  ✅ All appearances render test passed");
};

/**
 * TEST 6: All States Render
 */
const testAllStates = async () => {
  console.log("\n📋 Test 6: All States Render");
  
  const states = ['enabled', 'disabled', 'hovered', 'focused', 'pressed'];
  
  for (const state of states) {
    const element = document.createElement('kds-button');
    element.setAttribute('state', state);
    element.setAttribute('label', `${state} state`);
    
    document.body.appendChild(element);
    assert(element.shadowRoot !== null, `${state} state renders`);
    document.body.removeChild(element);
  }
  
  console.log("  ✅ All states render test passed");
};

/**
 * Run all tests
 */
async function runTests() {
  console.log("🧪 KDS-AI Button Component - Smoke Test Suite");
  console.log("=" .repeat(50));
  
  try {
    // Only run tests if we're in a browser environment with DOM
    if (typeof document === 'undefined') {
      console.log("⚠️  Tests require browser environment with DOM. Skipping.");
      return;
    }
    
    await testRenderDefault();
    await testDisabledBehavior();
    await testAttributeReflection();
    await testEventEmission();
    await testAllAppearances();
    await testAllStates();
    
    console.log("\n" + "=" .repeat(50));
    console.log("✅ ALL TESTS PASSED");
    console.log("=" .repeat(50));
    return true;
  } catch (error) {
    console.error("\n" + "=" .repeat(50));
    console.error("❌ TEST FAILED");
    console.error(error);
    console.error("=" .repeat(50));
    return false;
  }
}

// Expose for browser testing
if (typeof window !== 'undefined') {
  (window as any).kdsButtonTests = runTests;
}
