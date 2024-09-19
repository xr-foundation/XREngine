
import { MenuProps, Menu as MuiMenu } from '@mui/material'
import React from 'react'

const Menu = (props: MenuProps) => <MuiMenu {...props} />

Menu.displayName = 'Menu'

Menu.defaultProps = {
  open: false
}

export default Menu
