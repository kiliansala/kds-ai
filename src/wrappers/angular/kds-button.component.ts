import { Component, Input, Output, EventEmitter, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import '../../components/kds-button';

/**
 * KdsButtonComponent - Angular Wrapper for Button Web Component v1.0.0
 *
 * STRICT API PARITY: This component wraps the canonical Web Component with
 * exactly 7 inputs (no extras), 1 output (kds-click), and 2 slots (default + icon).
 *
 * ============================================================================
 * USAGE EXAMPLES
 * ============================================================================
 *
 * EXAMPLE 1: Basic button with all 5 appearances
 * ─────────────────────────────────────────────
 * <kds-button-ng appearance="filled">
 *   Click Me
 * </kds-button-ng>
 *
 * <kds-button-ng appearance="outlined">
 *   Outlined
 * </kds-button-ng>
 *
 * <kds-button-ng appearance="text">
 *   Text
 * </kds-button-ng>
 *
 * <kds-button-ng appearance="tonal">
 *   Tonal
 * </kds-button-ng>
 *
 * <kds-button-ng appearance="elevated">
 *   Elevated
 * </kds-button-ng>
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * EXAMPLE 2: Icon support via Material Symbols
 * ─────────────────────────────────────────────
 * <kds-button-ng [hasIcon]="true" icon="add" appearance="filled">
 *   Add Item
 * </kds-button-ng>
 *
 * <kds-button-ng [hasIcon]="true" icon="delete" appearance="outlined">
 *   Delete
 * </kds-button-ng>
 *
 * <kds-button-ng [hasIcon]="true" icon="settings" appearance="tonal">
 *   Settings
 * </kds-button-ng>
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * EXAMPLE 3: Custom icon slot (standard WC semantics via ng-content)
 * ─────────────────────────────────────────────────────────────────
 * <kds-button-ng appearance="tonal">
 *   <span slot="icon">🎨</span>
 *   Design
 * </kds-button-ng>
 *
 * <kds-button-ng appearance="filled">
 *   <svg slot="icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
 *     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z..."/>
 *   </svg>
 *   Done
 * </kds-button-ng>
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * EXAMPLE 4: Button states (5 state variants)
 * ──────────────────────────────────────────
 * <kds-button-ng state="enabled">
 *   Enabled
 * </kds-button-ng>
 *
 * <kds-button-ng state="disabled">
 *   Disabled
 * </kds-button-ng>
 *
 * <kds-button-ng state="hovered">
 *   Hovered
 * </kds-button-ng>
 *
 * <kds-button-ng state="focused">
 *   Focused
 * </kds-button-ng>
 *
 * <kds-button-ng state="pressed">
 *   Pressed
 * </kds-button-ng>
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * EXAMPLE 5: Form button types (button, submit, reset)
 * ──────────────────────────────────────────────────
 * <form>
 *   <kds-button-ng type="button">
 *     Regular Button
 *   </kds-button-ng>
 *
 *   <kds-button-ng type="submit" appearance="filled">
 *     Submit
 *   </kds-button-ng>
 *
 *   <kds-button-ng type="reset" appearance="outlined">
 *     Reset
 *   </kds-button-ng>
 * </form>
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * EXAMPLE 6: Link button via href property
 * ────────────────────────────────────────
 * <kds-button-ng href="https://example.com" appearance="filled">
 *   Go to Example
 * </kds-button-ng>
 *
 * <kds-button-ng href="/docs" appearance="text">
 *   Read Documentation
 * </kds-button-ng>
 *
 * <kds-button-ng
 *   href="/settings"
 *   [hasIcon]="true"
 *   icon="settings"
 *   appearance="tonal">
 *   Settings
 * </kds-button-ng>
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * EXAMPLE 7: Event handling (kds-click output)
 * ────────────────────────────────────────────
 * <kds-button-ng (kds-click)="onButtonClick($event)" appearance="filled">
 *   Click Me
 * </kds-button-ng>
 *
 * // Component class:
 * onButtonClick(event: CustomEvent) {
 *   console.log('Button clicked!', event);
 *   console.log('Original event:', event.detail?.originalEvent);
 * }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * EXAMPLE 8: Dynamic properties with template expressions
 * ───────────────────────────────────────────────────────
 * <kds-button-ng
 *   [appearance]="buttonAppearance"
 *   [state]="isDisabled ? 'disabled' : 'enabled'"
 *   [hasIcon]="showIcon"
 *   [icon]="selectedIcon"
 *   [label]="buttonLabel"
 *   [type]="formButtonType"
 *   [href]="navigateTo"
 *   (kds-click)="handleClick($event)">
 *   {{ buttonText }}
 * </kds-button-ng>
 *
 * ============================================================================
 * API REFERENCE (STRICT PARITY)
 * ============================================================================
 *
 * @Input Properties (exactly 7, matching WC v1.0.0):
 * ─────────────────────────────────────────────────
 * appearance:  'filled' | 'outlined' | 'text' | 'tonal' | 'elevated'
 * state:       'enabled' | 'disabled' | 'hovered' | 'focused' | 'pressed'
 * hasIcon:     boolean
 * label:       string
 * icon:        string (Material Symbols icon name)
 * href:        string | null (makes button render as <a> tag)
 * type:        'button' | 'submit' | 'reset'
 *
 * @Output Events (exactly 1):
 * ─────────────────────────
 * (kds-click): CustomEvent emitted when button clicked; bubbles and is composed
 *
 * Projected Content Slots (standard WC semantics):
 * ───────────────────────────────────────────────
 * default slot:  Button text content via <ng-content></ng-content>
 * icon slot:     Custom icon via <span slot="icon">...</span> in projected content
 *
 * NO WRAPPER-ONLY INPUTS: This component has ZERO extra inputs beyond WC API.
 */
@Component({
  selector: 'kds-button-ng',
  standalone: true,
  template: `
    <kds-button
      [attr.appearance]="appearance"
      [attr.state]="state"
      [attr.has-icon]="hasIcon ? '' : null"
      [attr.label]="label"
      [attr.icon]="icon"
      [attr.href]="href"
      [attr.type]="type"
      (kds-click)="onKdsClick($event)">
      <ng-content></ng-content>
    </kds-button>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class KdsButtonComponent {
  /**
   * Visual appearance variant (Material Design 3)
   * @default 'filled'
   */
  @Input() appearance: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal' = 'filled';

  /**
   * Interaction state
   * @default 'enabled'
   */
  @Input() state: 'enabled' | 'disabled' | 'hovered' | 'focused' | 'pressed' = 'enabled';

  /**
   * Whether to show icon slot (maps to has-icon attribute)
   * @default false
   */
  @Input() hasIcon: boolean = false;

  /**
   * Button text label
   * @default ''
   */
  @Input() label: string = '';

  /**
   * Material Symbols icon name (e.g., 'add', 'delete')
   * @default 'add'
   */
  @Input() icon: string = 'add';

  /**
   * Optional URL; when set, button renders as <a> tag (semantic link)
   * @default null
   */
  @Input() href: string | null = null;

  /**
   * Form button type
   * @default 'button'
   */
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  /**
   * Emits when button is clicked
   * Fires CustomEvent with detail: { originalEvent: PointerEvent }
   * Event bubbles and is composed
   */
  @Output('kds-click') kdsClick = new EventEmitter<CustomEvent>();

  constructor(private el: ElementRef) {}

  onKdsClick(event: Event) {
    this.kdsClick.emit(event as CustomEvent);
  }
}

