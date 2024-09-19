
import { DialogContentProps, DialogContent as MuiDialogContent } from '@mui/material'
import React from 'react'

import DialogContentText from '@xrengine/ui/src/primitives/mui/DialogContentText'
import TextField from '@xrengine/ui/src/primitives/mui/TextField'

const DialogContent = ({ children, ...props }: DialogContentProps & any) => (
  <MuiDialogContent {...props}>{children}</MuiDialogContent>
)

DialogContent.displayName = 'DialogContent'

DialogContent.defaultProps = {
  children: (
    <>
      <DialogContentText />
      <TextField />
    </>
  )
}

export default DialogContent
