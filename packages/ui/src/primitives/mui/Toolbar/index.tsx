
import { Toolbar as MuiToolbar, ToolbarProps } from '@mui/material'
import React from 'react'

import Icon from '@xrengine/ui/src/primitives/mui/Icon'
import IconButton from '@xrengine/ui/src/primitives/mui/IconButton'
import Typography from '@xrengine/ui/src/primitives/mui/Typography'

const Toolbar = (props: ToolbarProps) => <MuiToolbar {...props} />

Toolbar.displayName = 'Toolbar'

Toolbar.defaultProps = {
  children: (
    <>
      <IconButton icon={<Icon type="Menu" />} />
      <Typography variant="h1" component="h2" />
    </>
  )
}

export default Toolbar
