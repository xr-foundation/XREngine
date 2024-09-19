import Component from './index'

export default {
  title: 'Primitives/Tailwind/Radio',
  component: Component,
  parameters: {
    componentSubtitle: 'Radio',
    jest: 'Radio.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  }
}

export const Default = {
  args: {
    options: [
      { name: 'A1', value: 'a1' },
      { name: 'B2', value: 'b2' },
      { name: 'C3', value: 'c3' }
    ],
    currentValue: 'b2',
    onChange: () => {}
  }
}
