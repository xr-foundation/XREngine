
import { DialogTitleProps, DialogTitle as MuiDialogTitle } from '@mui/material'
import React from 'react'

const DialogTitle = ({ children, ...props }: DialogTitleProps) => <MuiDialogTitle {...props}>{children}</MuiDialogTitle>

DialogTitle.displayName = 'DialogTitle'

DialogTitle.defaultProps = {
  children: "I'm a Dialog Title"
}

export default DialogTitle
