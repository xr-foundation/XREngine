import { GridProps, Grid as MuiGrid } from '@mui/material'
import React, { ReactNode } from 'react'

export interface Props {
  children: ReactNode
}

const Grid = ({ children, ...props }: GridProps) => <MuiGrid {...props}>{children}</MuiGrid>

Grid.displayName = 'Grid'

Grid.defaultProps = {
  children: null
}

export default Grid
