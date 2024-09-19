
import { ContainerProps, Container as MuiContainer } from '@mui/material'
import React from 'react'

import Typography from '@xrengine/ui/src/primitives/mui/Typography'

const Container = (props: ContainerProps & { component?: string }) => <MuiContainer {...props} />

Container.displayName = 'Container'

Container.defaultProps = {
  children: <Typography />
}

export default Container
