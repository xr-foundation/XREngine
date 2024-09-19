
import Component from './index'

const argTypes = {}

export default {
  title: 'Editor/Input/ImagePreview',
  component: Component,
  parameters: {
    componentSubtitle: 'ImagePreviewInput',
    jest: 'ImagePreview.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}
export const Default = { args: Component.defaultProps }
