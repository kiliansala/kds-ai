import { Component, Input, Output, EventEmitter, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import '../../components/kds-button';

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
  @Input() appearance: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal' = 'filled';
  @Input() state: 'enabled' | 'disabled' | 'hovered' | 'focused' | 'pressed' = 'enabled';
  @Input() hasIcon: boolean = false;
  @Input() label: string = '';
  @Input() icon: string = 'add';
  @Input() href: string | null = null;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  @Output('kds-click') kdsClick = new EventEmitter<CustomEvent>();

  constructor(private el: ElementRef) {}

  onKdsClick(event: Event) {
    this.kdsClick.emit(event as CustomEvent);
  }
}
