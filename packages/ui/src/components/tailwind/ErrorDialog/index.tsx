
import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { t } from 'i18next'
import React from 'react'
import ErrorView from '../../../primitives/tailwind/ErrorView'
import Modal, { ModalProps } from '../../../primitives/tailwind/Modal'

interface ErrorDialogProps {
  title: string
  description?: string
  modalProps?: ModalProps
}

const ErrorDialog = ({ title, description, modalProps }: ErrorDialogProps) => {
  return (
    <Modal
      title={t('admin:components.common.confirmation')}
      onClose={PopoverState.hidePopupover}
      showCloseButton={false}
      onSubmit={() => PopoverState.hidePopupover()}
      className="w-[50vw] max-w-2xl"
      {...modalProps}
    >
      <ErrorView title={title} description={description} />
    </Modal>
  )
}

export default ErrorDialog
