import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Button',
  component: Component,
  parameters: {
    componentSubtitle: 'Button',
    jest: 'Button.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Default = { args: Component.defaultProps }
