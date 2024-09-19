import { TableContainer as MuiTableContainer, TableContainerProps } from '@mui/material'
import React from 'react'

const TableContainer = ({ children, ...props }: TableContainerProps) => (
  <MuiTableContainer {...props}>{children}</MuiTableContainer>
)

TableContainer.displayName = 'TableContainer'

TableContainer.defaultProps = {
  children: null
}

export default TableContainer
