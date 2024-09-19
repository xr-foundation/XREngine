import { TableHead as MuiTableHead } from '@mui/material'
import React, { ReactNode } from 'react'

export interface Props {
  children: ReactNode
  className?: string
}

const TableHead = ({ children, ...props }: Props) => <MuiTableHead {...props}>{children}</MuiTableHead>

TableHead.displayName = 'TableHead'

TableHead.defaultProps = {
  children: null
}

export default TableHead
