
import { TableCell as MuiTableCell, TableCellProps } from '@mui/material'
import React from 'react'

const TableCell = ({ children, ...props }: TableCellProps) => <MuiTableCell {...props}>{children}</MuiTableCell>

TableCell.displayName = 'TableCell'

TableCell.defaultProps = {
  children: `I'm a Table cell`
}

export default TableCell
