import Component from './index'

export default {
  title: 'Primitives/Tailwind/Checkbox',
  component: Component,
  parameters: {
    componentSubtitle: 'Checkbox',
    jest: 'Checkbox.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  }
}

export const Unchecked = {
  args: {
    label: 'Checkbox Example',
    value: false,
    onChange: () => {}
  }
}

export const Checked = {
  args: {
    label: 'Checkbox Checked Example',
    value: true,
    onChange: () => {}
  }
}
