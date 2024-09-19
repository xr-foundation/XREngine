import { ListItemTextProps, ListItemText as MuiListItemText } from '@mui/material'
import React from 'react'

const ListItemText = ({ children, ...props }: ListItemTextProps) => (
  <MuiListItemText {...props}>{children}</MuiListItemText>
)

ListItemText.displayName = 'ListItemText'

ListItemText.defaultProps = {
  children: null
}

export default ListItemText
