import { ModalProps, Modal as MuiModal } from '@mui/material'
import React from 'react'

const Modal = ({ children, ...props }: ModalProps) => <MuiModal {...props}>{children}</MuiModal>

Modal.displayName = 'Modal'

Modal.defaultProps = {
  children: <div>Hello</div>,
  open: true
}

export default Modal
