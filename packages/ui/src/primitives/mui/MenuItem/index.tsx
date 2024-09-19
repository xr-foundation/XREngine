
import { MenuItemProps, MenuItem as MuiMenuItem } from '@mui/material'
import React from 'react'

const MenuItem = (props: MenuItemProps) => <MuiMenuItem {...props} />

MenuItem.displayName = 'MenuItem'

MenuItem.defaultProps = { children: null }

export default MenuItem
