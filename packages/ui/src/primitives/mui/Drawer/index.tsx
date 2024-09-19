
import { DrawerProps, Drawer as MuiDrawer } from '@mui/material'
import React from 'react'

const Drawer = (props: DrawerProps) => <MuiDrawer {...props} />

Drawer.displayName = 'Drawer'

Drawer.defaultProps = { children: null }

export default Drawer
