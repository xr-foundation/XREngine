
import { ListItemIconProps, ListItemIcon as MuiListItemIcon } from '@mui/material'
import React from 'react'

const ListItemIcon = (props: ListItemIconProps) => <MuiListItemIcon {...props} />

ListItemIcon.displayName = 'ListItemIcon'

ListItemIcon.defaultProps = { children: null }

export default ListItemIcon
