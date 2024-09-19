import Component from './index'

const argTypes = {}

export default {
  title: 'Editor/Panel/VisualScript',
  component: Component,
  parameters: {
    componentSubtitle: 'VisualScriptPanelTitle',
    jest: 'VisualScriptPanelTitle.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Default = { args: {} }
