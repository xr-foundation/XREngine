import { Typography as MuiTypography, TypographyProps } from '@mui/material'
import React from 'react'

const Typography = (props: TypographyProps & { component?: string }) => <MuiTypography {...props} />

Typography.displayName = 'Typography'

Typography.defaultProps = {
  children: "I'm typography"
}

export default Typography
