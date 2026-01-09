/**
 * Figma Code Connect Configuration
 * 
 * This file contains the mapping between Figma Components and Code Components.
 * Ensure you have 'figma' CLI installed and properly configured.
 */

// This is a conceptual example of what the Figma Code Connect signature looks like.
// In a real environment, you would import figma from '@figma/code-connect'

const figma = {
  connect: (url: string, config: any) => { console.log('Mock connecting', url); },
  boolean: (name: string) => `boolean('${name}')`,
  string: (name: string) => `string('${name}')`,
  enum: (name: string, mapping: any) => `enum('${name}', ${JSON.stringify(mapping)})`,
  instance: (name: string) => `instance('${name}')`,
};

import { KdsButton } from '../src/components/kds-button';

// Button Connection
figma.connect(
  // Replace with the actual URL of the Figma Component
  'https://www.figma.com/design/example/Button',
  {
    render: (props: any) => {
      // Logic to generate the HTML snippet string for the Figma Dev Mode panel
      const attrString = Object.entries(props)
        .map(([key, val]) => {
           if (val === true) return ` ${key}`;
           if (val === false || val === undefined) return '';
           return ` ${key}="${val}"`;
        })
        .join('');
        
      return `<kds-button${attrString}>${props.label}</kds-button>`;
    },
    props: {
        variant: figma.enum('Type', { 
            'Primary': 'primary', 
            'Secondary': 'secondary',
            'Tertiary': 'tertiary',
            'Danger': 'danger'
        }),
        size: figma.enum('Size', { 
            'Small': 'sm', 
            'Medium': 'md', 
            'Large': 'lg' 
        }),
        disabled: figma.boolean('Disabled'),
        label: figma.string('Label'),
        icon: figma.instance('Icon'), // Mapping pending Icon implementation
        loading: figma.boolean('Loading')
    },
    example: (props: any) => {
        // Returns the actual runtime component for visual regression tests if needed
        return new KdsButton(); 
    }
  }
);
