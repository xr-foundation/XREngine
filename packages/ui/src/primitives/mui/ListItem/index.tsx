
import { ListItemProps, ListItem as MuiListItem } from '@mui/material'
import React from 'react'

const ListItem = ({ children, ...props }: ListItemProps & { button?: any }) => (
  <MuiListItem {...props}>{children}</MuiListItem>
)

ListItem.displayName = 'ListItem'

ListItem.defaultProps = {
  children: null
}

export default ListItem
