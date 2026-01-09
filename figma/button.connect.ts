import figma from '@figma/code-connect';
import { KdsButton } from '../src/components/kds-button';

// Button Connection
figma.connect(
  'https://www.figma.com/design/example/Button',
  {
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
        icon: figma.boolean('Has Icon'), // Simplified for now
        loading: figma.boolean('Loading')
    },
    example: (props) => {
        const attrString = Object.entries(props)
        .map(([key, val]) => {
            if (key === 'icon') return ''; // Skip icon logic for briefness, or handle specifically
            if (val === true) return ` ${key}`;
            if (val === false || val === undefined) return '';
            return ` ${key}="${val}"`;
        })
        .join('');
        
    return `<kds-button${attrString}>${props.label}</kds-button>`;
    }
  }
);
