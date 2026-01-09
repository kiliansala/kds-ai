import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './kds-button';

const meta: Meta = {
  title: 'Components/Button',
  component: 'kds-button',
  argTypes: {
    appearance: {
      name: 'Appearance',
      control: { type: 'select' },
      options: ['filled', 'outlined', 'text', 'elevated', 'tonal'],
      description: 'Visual style matching Figma.'
    },
    state: {
      name: 'State',
      control: { type: 'select' },
      options: ['enabled', 'disabled', 'hovered', 'focused', 'pressed'],
      description: 'Interaction state.'
    },
    hasIcon: {
      name: 'Show Icon',
      control: { type: 'boolean' },
      description: 'Toggles icon visibility.'
    },
    label: {
      name: 'Label text',
      control: { type: 'text' },
      description: 'Text content.'
    },
    icon: {
      name: 'Icon name',
      control: { type: 'text' },
      description: 'Icon instance name.'
    }
  },
  args: {
    appearance: 'filled',
    state: 'enabled',
    hasIcon: false,
    label: 'Button',
    icon: 'add'
  },
  render: (args) => {
    return html`
      <kds-button 
        appearance="${args.appearance}" 
        state="${args.state}" 
        ?has-icon="${args.hasIcon}" 
        label="${args.label}" 
        icon="${args.icon}">
        ${args.label}
      </kds-button>
    `;
  }
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Outlined: Story = {
  args: {
    appearance: 'outlined'
  }
};

export const Tonal: Story = {
  args: {
    appearance: 'tonal'
  }
};

export const Disabled: Story = {
  args: {
    state: 'disabled'
  }
};

export const WithIcon: Story = {
  args: {
    hasIcon: true,
    icon: 'favorite'
  }
};
