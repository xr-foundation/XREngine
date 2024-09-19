
import Text from './index'

export default {
  title: 'Primitives/Tailwind/Input',
  component: Text,
  parameters: {
    componentSubtitle: 'Input',
    jest: 'Input.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  }
}

export const Default = {
  args: {
    value: 'My Text Input',
    label: 'Input Label'
  }
}

export const WithDescription = {
  args: {
    value: 'Text Input',
    label: 'Label',
    description: 'A simple description for the Input'
  }
}
