import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { NO_PROXY, useMutableState } from '@xrengine/hyperflux'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Modal from '@xrengine/ui/src/primitives/tailwind/Modal'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { onNewScene } from '../../functions/sceneFunctions'
import { EditorState } from '../../services/EditorServices'

export default function CreateSceneDialog() {
  const element = useMutableState(EditorState).uiAddons.newScene.get(NO_PROXY)
  const { t } = useTranslation()
  return (
    <Modal
      title={t('editor:dialog.createScene.title')}
      className="w-[15vw] max-w-2xl"
      onClose={PopoverState.hidePopupover}
    >
      <div className="flex justify-center">
        <Button
          size="small"
          variant="outline"
          className="w-[10vw]"
          onClick={() => {
            onNewScene()
            PopoverState.hidePopupover()
          }}
        >
          {t('editor:dialog.createScene.create')}
        </Button>
      </div>
      <div className="flex justify-center">{Object.values(element).map((value) => value)}</div>
    </Modal>
  )
}
