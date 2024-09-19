import { DialogProps, Dialog as MuiDialog } from '@mui/material'
import React from 'react'

import DialogActions from '@xrengine/ui/src/primitives/mui/DialogActions'
import DialogContent from '@xrengine/ui/src/primitives/mui/DialogContent'
import DialogTitle from '@xrengine/ui/src/primitives/mui/DialogTitle'

const Dialog = ({ children, classes, ...props }: DialogProps & { classes?: any }) => (
  <MuiDialog classes={classes} {...props}>
    {children}
  </MuiDialog>
)

Dialog.displayName = 'Dialog'

Dialog.defaultProps = {
  open: true,
  children: (
    <>
      <DialogTitle />
      <DialogContent />
      <DialogActions />
    </>
  )
}

export default Dialog
