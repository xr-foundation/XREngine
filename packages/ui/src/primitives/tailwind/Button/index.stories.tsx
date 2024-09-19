

import { ArgTypes } from '@storybook/react'
import React from 'react'
import { IoAddOutline, IoSend } from 'react-icons/io5'

import Button from './index'

const argTypes: ArgTypes = {
  size: {
    control: 'select',
    options: ['small', 'medium', 'large']
  },
  variant: {
    control: 'select',
    options: ['primary', 'outline', 'danger']
  }
}

export default {
  title: 'Primitives/Tailwind/Button',
  component: Button,
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

export const Default = {
  args: {
    children: 'Submit'
  }
}

export const WithStartIcon = {
  args: {
    children: 'Submit',
    startIcon: <IoAddOutline />
  }
}

export const WithEndIcon = {
  args: {
    children: 'Send',
    endIcon: <IoSend />
  }
}
