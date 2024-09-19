import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { Entity } from '@xrengine/ecs'
import Modal from '@xrengine/ui/src/primitives/tailwind/Modal'
import React from 'react'
import { useTranslation } from 'react-i18next'
export default function PrefabConfirmationPanelDialog({ entity }: { entity: Entity }) {
  const { t } = useTranslation()

  return (
    <Modal
      title={t('editor:properties.prefab.lbl-confimation')}
      className="w-[50vw] max-w-2xl"
      onClose={PopoverState.hidePopupover}
      closeButtonText="OK"
    ></Modal>
  )
}
