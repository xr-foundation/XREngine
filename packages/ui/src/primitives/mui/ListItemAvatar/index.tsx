import { ListItemAvatarProps, ListItemAvatar as MuiListItemAvatar } from '@mui/material'
import React from 'react'

const ListItemAvatar = (props: ListItemAvatarProps) => <MuiListItemAvatar {...props} />

ListItemAvatar.displayName = 'ListItemAvatar'

ListItemAvatar.defaultProps = { children: null }

export default ListItemAvatar
