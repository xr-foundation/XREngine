import Component, { BooleanInputProp } from './index'

const argTypes: BooleanInputProp = { value: false, onChange: () => {} }

export default {
  title: 'Editor/Input/Boolean',
  component: Component,
  parameters: {
    componentSubtitle: 'BooleanInput',
    jest: 'Boolean.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}
export const Default = {
  args: {
    value: false
  }
}
