
import React from 'react'
import { GoDotFill } from 'react-icons/go'

import Badge from './index'

export default {
  title: 'Primitives/Tailwind/Badge',
  component: Badge,
  parameters: {
    componentSubtitle: 'Badge',
    design: {
      type: 'figma',
      url: ''
    }
  }
}

export const Default = {
  args: {
    label: 'Badge',
    variant: 'warning',
    icon: <GoDotFill />
  }
}
