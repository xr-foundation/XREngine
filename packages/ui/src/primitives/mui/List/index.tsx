
import { ListProps, List as MuiList } from '@mui/material'
import React from 'react'

const List = ({ children, ...props }: ListProps) => <MuiList {...props}>{children}</MuiList>

List.displayName = 'List'

List.defaultProps = {
  children: null
}

export default List
