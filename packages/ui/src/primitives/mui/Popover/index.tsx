
import { Popover as MuiPopover, PopoverProps } from '@mui/material'
import React from 'react'

import Typography from '@xrengine/ui/src/primitives/mui/Typography'

const Popover = ({ children, ...props }: PopoverProps & any) => <MuiPopover {...props}>{children}</MuiPopover>

Popover.displayName = 'Popover'

Popover.defaultProps = {
  children: (
    <>
      <Typography />
    </>
  ),
  open: true
}

export default Popover
