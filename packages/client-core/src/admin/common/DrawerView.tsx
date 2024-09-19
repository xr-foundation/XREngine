import Drawer, { DrawerClasses } from '@mui/material/Drawer'
import React from 'react'

import styles from '../old-styles/admin.module.scss'

interface Props {
  open: boolean
  classes?: Partial<DrawerClasses> | undefined
  children?: React.ReactNode
  onClose: () => void
}

const DrawerView = ({ open, classes, children, onClose }: Props) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      classes={classes}
      PaperProps={{ className: styles.paperDrawer }}
    >
      {children}
    </Drawer>
  )
}

export default DrawerView
