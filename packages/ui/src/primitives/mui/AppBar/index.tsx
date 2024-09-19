
import { AppBarProps, AppBar as MuiAppBar } from '@mui/material'
import React from 'react'

import Toolbar from '@xrengine/ui/src/primitives/mui/Toolbar'

const AppBar = (props: AppBarProps) => <MuiAppBar {...props} />

AppBar.displayName = 'AppBar'

AppBar.defaultProps = {
  children: (
    <>
      <Toolbar />
    </>
  )
}

export default AppBar
