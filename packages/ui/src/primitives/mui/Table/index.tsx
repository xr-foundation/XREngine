import { Table as MuiTable, TableProps } from '@mui/material'
import React from 'react'

import TableBody from '@xrengine/ui/src/primitives/mui/TableBody'
import TableCell from '@xrengine/ui/src/primitives/mui/TableCell'
import TableRow from '@xrengine/ui/src/primitives/mui/TableRow'

const Table = ({ children, ...props }: TableProps) => <MuiTable {...props}>{children}</MuiTable>

Table.displayName = 'Table'

Table.defaultProps = {
  children: (
    <TableBody>
      <TableRow>
        <TableCell>Hello</TableCell>
      </TableRow>
    </TableBody>
  )
}

export default Table
