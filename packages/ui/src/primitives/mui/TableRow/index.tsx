
import { TableRow as MuiTableRow, TableRowProps } from '@mui/material'
import React from 'react'

import TableCell from '@xrengine/ui/src/primitives/mui/TableCell'

const TableRow = ({ children, ...props }: TableRowProps) => <MuiTableRow {...props}>{children}</MuiTableRow>

TableRow.displayName = 'TableRow'

TableRow.defaultProps = {
  children: <TableCell />
}

export default TableRow
