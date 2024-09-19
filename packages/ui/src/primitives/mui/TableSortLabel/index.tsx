
import { TableSortLabel as MuiTableSortLabel, TableSortLabelProps } from '@mui/material'
import React from 'react'

const TableSortLabel = ({ children, ...props }: TableSortLabelProps) => (
  <MuiTableSortLabel {...props}>{children}</MuiTableSortLabel>
)

TableSortLabel.displayName = 'TableSortLabel'

TableSortLabel.defaultProps = {
  children: null
}

export default TableSortLabel
