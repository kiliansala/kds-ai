import figma from '@figma/code-connect';

const html = (strings: TemplateStringsArray, ...values: any[]) => String.raw({ raw: strings }, ...values);

figma.connect(
  'https://www.figma.com/design/hp3Ddy3vnBYGQgmR2HKyI4/components.material?node-id=53923-27460&m=dev',
  {
    props: {
      appearance: figma.enum('Appearance', {
        'Filled': 'filled',
        'Outlined': 'outlined',
        'Text': 'text',
        'Tonal': 'tonal',
        'Elevated': 'elevated', 
      }),
      // Map state directly to attribute string or empty if default
      state: figma.enum('State', {
        'Enabled': '', 
        'Disabled': ' state="disabled"',
        'Hovered': ' state="hovered"',
        'Focused': ' state="focused"',
        'Pressed': ' state="pressed"'
      }),
      // Has Icon boolean maps to attribute presence
      hasIcon: figma.boolean('Show Icon', {
        true: ' has-icon',
        false: ''
      }),
      label: figma.string('Label text'),
      // Capture the icon instance so we can extract its name; component expects a string token.
      icon: figma.instance('Icon'), 
    },
    example: ({ appearance, state, hasIcon, label, icon }) => {
      const iconName = (icon as any)?.name ?? icon ?? 'add';
      return html`<kds-button appearance="${appearance}"${state}${hasIcon} icon="${iconName}">${label}</kds-button>`;
    }
  }
);
