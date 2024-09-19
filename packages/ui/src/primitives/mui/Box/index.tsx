
import { BoxProps, Box as MuiBox } from '@mui/material'
import React from 'react'

const Box = ({ children, ...props }: BoxProps) => <MuiBox {...props}>{children}</MuiBox>

Box.displayName = 'Box'

Box.defaultProps = { children: null }

export default Box
