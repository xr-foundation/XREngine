

import { ArgTypes } from '@storybook/react'
import React from 'react'

import Button from '../Button'
import Tooltip from './index'

const argTypes: ArgTypes = {}

const TooltipStory = (title) => {
  return (
    <div className="flex h-screen items-center justify-center">
      <Tooltip content={title}>
        <Button title="Submit" />
      </Tooltip>
    </div>
  )
}

export default {
  title: 'Primitives/Tailwind/Tooltip',
  component: TooltipStory,
  parameters: {
    componentSubtitle: 'Button',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Default = {
  args: {
    title: 'Tooltip info'
  }
}
