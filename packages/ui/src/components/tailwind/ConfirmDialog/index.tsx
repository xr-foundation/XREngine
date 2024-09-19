

import { t } from 'i18next'
import React from 'react'

import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { useHookstate } from '@xrengine/hyperflux'

import Modal, { ModalProps } from '../../../primitives/tailwind/Modal'
import Text from '../../../primitives/tailwind/Text'

interface ConfirmDialogProps {
  title?: string
  text: string
  onSubmit: () => Promise<void> | void
  onClose?: () => void
  modalProps?: Partial<ModalProps>
}

export const ConfirmDialog = ({ title, text, onSubmit, onClose, modalProps }: ConfirmDialogProps) => {
  const errorText = useHookstate('')
  const modalProcessing = useHookstate(false)

  const handled = async () => {
    modalProcessing.set(true)
    try {
      await onSubmit()
      PopoverState.hidePopupover()
    } catch (error) {
      errorText.set(error.message)
    }
    modalProcessing.set(false)
  }

  return (
    <Modal
      title={title || t('admin:components.common.confirmation')}
      onSubmit={handled}
      onClose={() => {
        PopoverState.hidePopupover()
        onClose?.()
      }}
      className="w-[50vw] max-w-2xl"
      submitLoading={modalProcessing.value}
      {...modalProps}
    >
      <div className="flex flex-col items-center gap-2">
        <Text>{text}</Text>
        {errorText.value && <Text className="text-red-700	">{errorText.value}</Text>}
      </div>
    </Modal>
  )
}

export default ConfirmDialog
