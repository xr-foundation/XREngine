import { DividerProps, Divider as MuiDivider } from '@mui/material'
import React from 'react'

const Divider = (props: DividerProps & { component?: string }) => <MuiDivider {...props} />

Divider.displayName = 'Divider'

Divider.defaultProps = { children: null }

export default Divider
