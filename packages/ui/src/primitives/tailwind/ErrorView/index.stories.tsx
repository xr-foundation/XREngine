

import { ArgTypes } from '@storybook/react'

import ErrorView from './index'

const argTypes: ArgTypes = {}

export default {
  title: 'Primitives/Tailwind/ErrorView',
  component: ErrorView,
  parameters: {
    componentSubtitle: 'ErrorView',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Default = {
  args: {
    className: ''
  }
}
