import React, { ReactNode } from 'react'

import { useTranslation } from 'react-i18next'
import { MdClose } from 'react-icons/md'
import { twMerge } from 'tailwind-merge'
import Button from '../Button'
import LoadingView from '../LoadingView'
import Text from '../Text'

export interface ModalProps {
  id?: string
  title?: string
  hideFooter?: boolean
  className?: string
  rawChildren?: ReactNode
  children?: ReactNode
  submitLoading?: boolean
  showCloseButton?: boolean
  closeButtonDisabled?: boolean
  submitButtonDisabled?: boolean
  closeButtonText?: string
  submitButtonText?: string
  onClose?: (isHeader: boolean) => void
  onSubmit?: () => void
}

export const ModalHeader = ({
  title,
  onClose
}: {
  closeIcon?: boolean
  title?: string
  onClose?: (isHeader: boolean) => void
}) => {
  // sticky top-0 z-10 bg-theme-surface-main
  return (
    <div className="relative flex items-center justify-center border-b border-b-theme-primary px-6 py-5">
      {title && <Text>{title}</Text>}
      <Button
        variant="outline"
        className="absolute right-0 border-0 dark:bg-transparent dark:text-[#A3A3A3]"
        startIcon={<MdClose />}
        onClick={() => onClose && onClose(true)}
      />
    </div>
  )
}

export const ModalFooter = ({
  id,
  onCancel,
  onSubmit,
  submitLoading,
  closeButtonDisabled,
  submitButtonDisabled,
  closeButtonText,
  submitButtonText,
  showCloseButton = true
}: {
  id?: string
  onCancel?: (isHeader: boolean) => void
  onSubmit?: () => void
  submitLoading?: boolean
  closeButtonDisabled?: boolean
  submitButtonDisabled?: boolean
  closeButtonText?: string
  submitButtonText?: string
  showCloseButton?: boolean
}) => {
  const { t } = useTranslation()
  return (
    <div className="grid grid-flow-col border-t border-t-theme-primary px-6 py-5">
      {showCloseButton && (
        <Button
          data-test-id={`${id}-close-button`}
          variant="secondary"
          disabled={closeButtonDisabled}
          onClick={() => onCancel && onCancel(false)}
        >
          {closeButtonText || t('common:components.cancel')}
        </Button>
      )}
      {onSubmit && (
        <Button
          data-test-id={`${id}-submit-button`}
          endIcon={submitLoading ? <LoadingView spinnerOnly className="h-6 w-6" /> : undefined}
          disabled={submitButtonDisabled || submitLoading}
          onClick={onSubmit}
          className="place-self-end"
        >
          {submitButtonText || t('common:components.confirm')}
        </Button>
      )}
    </div>
  )
}

const Modal = ({
  id,
  title,
  onClose,
  onSubmit,
  hideFooter,
  rawChildren,
  children,
  className,
  submitLoading,
  closeButtonText,
  submitButtonText,
  closeButtonDisabled,
  submitButtonDisabled,
  showCloseButton = true
}: ModalProps) => {
  const twClassName = twMerge('relative z-50 w-full bg-theme-surface-main', className)
  return (
    <div data-test-id={id} className={twClassName}>
      <div className="relative rounded-lg shadow">
        {onClose && <ModalHeader title={title} onClose={onClose} />}
        {rawChildren}
        {children && <div className="h-fit max-h-[60vh] w-full overflow-y-auto px-10 py-6">{children}</div>}

        {!hideFooter && (
          <ModalFooter
            id={id}
            closeButtonText={closeButtonText}
            submitButtonText={submitButtonText}
            closeButtonDisabled={closeButtonDisabled}
            submitButtonDisabled={submitButtonDisabled}
            onCancel={onClose}
            onSubmit={onSubmit}
            submitLoading={submitLoading}
            showCloseButton={showCloseButton}
          />
        )}
      </div>
    </div>
  )
}

export default Modal
