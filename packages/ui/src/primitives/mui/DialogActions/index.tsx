import { DialogActionsProps, DialogActions as MuiDialogActions } from '@mui/material'
import React from 'react'

import Button from '@xrengine/ui/src/primitives/mui/Button'

const DialogActions = ({ children, ...props }: DialogActionsProps & any) => (
  <MuiDialogActions {...props}>{children}</MuiDialogActions>
)

DialogActions.displayName = 'DialogActions'

DialogActions.defaultProps = {
  children: (
    <>
      <Button />
    </>
  )
}

export default DialogActions
