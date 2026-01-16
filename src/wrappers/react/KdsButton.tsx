import React, { forwardRef, useLayoutEffect, useRef, ReactNode } from 'react';
import '../../components/kds-button';

// Extend the global HTMLElementTagNameMap to include kds-button in JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'kds-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'appearance'?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';
        'state'?: 'enabled' | 'disabled' | 'hovered' | 'focused' | 'pressed';
        'has-icon'?: boolean | string;
        'label'?: string;
        'icon'?: string;
        'href'?: string;
        'type'?: string;
      };
    }
  }
}

export interface KdsButtonProps extends React.HTMLAttributes<HTMLElement> {
  // Web Component API Properties (v1.0.0 spec)
  appearance?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';
  state?: 'enabled' | 'disabled' | 'hovered' | 'focused' | 'pressed';
  hasIcon?: boolean;
  label?: string;
  icon?: string;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  
  // Web Component Event Handler
  onKdsClick?: (e: CustomEvent) => void;
  
  // React Slot Support: iconSlot renders custom JSX in the icon slot
  // If provided, this content overrides the Material Symbols icon
  // Example: iconSlot={<MyCustomIcon />} or iconSlot="🎨"
  iconSlot?: ReactNode;
}

export const KdsButton = forwardRef<HTMLElement, KdsButtonProps>(
  ({ onKdsClick, hasIcon, iconSlot, children, ...props }, ref) => {
    const elementRef = useRef<HTMLElement>(null);
    const combinedRef = (node: HTMLElement) => {
      // @ts-ignore
      elementRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
    };

    useLayoutEffect(() => {
      const element = elementRef.current;
      if (!element || !onKdsClick) return;

      const handleEvent = (e: Event) => onKdsClick(e as CustomEvent);
      element.addEventListener('kds-click', handleEvent);
      return () => {
        element.removeEventListener('kds-click', handleEvent);
      };
    }, [onKdsClick]);

    return (
      <kds-button
        ref={combinedRef}
        has-icon={hasIcon}
        {...props}
      >
        {/* Icon slot: renders custom iconSlot JSX in slot="icon" */}
        {iconSlot && (
          <span slot="icon">
            {iconSlot}
          </span>
        )}
        {/* Default slot: renders button text content via children */}
        {children}
      </kds-button>
    );
  }
);
