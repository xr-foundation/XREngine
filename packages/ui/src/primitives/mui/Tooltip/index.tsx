
import { Tooltip as MuiTooltip, TooltipProps } from '@mui/material'
import React from 'react'

import Icon from '@xrengine/ui/src/primitives/mui/Icon'
import IconButton from '@xrengine/ui/src/primitives/mui/IconButton'

const Tooltip = ({ children, ...props }: TooltipProps) => (
  <MuiTooltip {...props}>
    <span>{children}</span>
  </MuiTooltip>
)

Tooltip.displayName = 'Tooltip'

Tooltip.defaultProps = {
  children: <IconButton icon={<Icon type="Menu" />} />,
  title: 'Tooltip'
}

export default Tooltip
