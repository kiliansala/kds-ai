import React, { forwardRef, useLayoutEffect, useRef } from 'react';
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
  // Web Component Button v1.0.0 public API (exactly 7 properties)
  appearance?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';
  state?: 'enabled' | 'disabled' | 'hovered' | 'focused' | 'pressed';
  hasIcon?: boolean;
  label?: string;
  icon?: string;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  
  // Web Component Event Handler
  onKdsClick?: (e: CustomEvent) => void;
}

export const KdsButton = forwardRef<HTMLElement, KdsButtonProps>(
  ({ onKdsClick, hasIcon, children, ...props }, ref) => {
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
        {children}
      </kds-button>
    );
  }
);
