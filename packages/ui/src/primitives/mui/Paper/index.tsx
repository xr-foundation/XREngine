import { Paper as MuiPaper, PaperProps } from '@mui/material'
import React from 'react'

import Typography from '@xrengine/ui/src/primitives/mui/Typography'

const Paper = ({ children, ...props }: PaperProps & { component?: string }) => (
  <MuiPaper {...props}>{children}</MuiPaper>
)

Paper.displayName = 'Paper'

Paper.defaultProps = {
  children: (
    <>
      <Typography />
    </>
  )
}

export default Paper
