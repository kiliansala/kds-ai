import figma from '@figma/code-connect';

const html = (strings: TemplateStringsArray, ...values: any[]) => String.raw({ raw: strings }, ...values);

figma.connect(
  'https://www.figma.com/design/hp3Ddy3vnBYGQgmR2HKyI4/components.material?node-id=53923-27461&m=dev', // Placeholder ID
  {
    props: {
      label: figma.string('Label text'),
      placeholder: figma.string('Placeholder text'),
      value: figma.string('Value'),
      helperText: figma.string('Helper text'),
      errorText: figma.string('Error text'),
      disabled: figma.boolean('Disabled'),
      readonly: figma.boolean('Read only'),
      type: figma.enum('Type', {
        'Text': 'text',
        'Password': 'password',
        'Email': 'email',
        'Number': 'number'
      }),
      required: figma.boolean('Required')
    },
    example: ({ label, placeholder, value, helperText, errorText, disabled, readonly, type, required }) => 
      html`<kds-text-field 
        label="${label}" 
        placeholder="${placeholder}" 
        value="${value}" 
        helper-text="${helperText}" 
        ${errorText ? `error-text="${errorText}"` : ''}
        ${disabled ? 'disabled' : ''}
        ${readonly ? 'readonly' : ''}
        type="${type}"
        ${required ? 'required' : ''}
      ></kds-text-field>`
  }
);
