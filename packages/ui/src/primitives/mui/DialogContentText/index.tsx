
import { DialogContentTextProps, DialogContentText as MuiDialogContentText } from '@mui/material'
import React from 'react'

const DialogContentText = ({ children, ...props }: DialogContentTextProps & any) => (
  <MuiDialogContentText {...props}>{children}</MuiDialogContentText>
)

DialogContentText.displayName = 'DialogContentText'

DialogContentText.defaultProps = {
  children: 'I am DialogContentText'
}

export default DialogContentText
