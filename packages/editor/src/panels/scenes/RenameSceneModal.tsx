import React from 'react'
import { useTranslation } from 'react-i18next'

import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'

import { renameScene } from '@xrengine/client-core/src/world/SceneAPI'
import { StaticResourceType } from '@xrengine/common/src/schema.type.module'
import isValidSceneName from '@xrengine/common/src/utils/validateSceneName'
import { useHookstate } from '@xrengine/hyperflux'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import Modal from '@xrengine/ui/src/primitives/tailwind/Modal'

type Props = {
  sceneName: string
  scene: StaticResourceType
  onRenameScene?: (newName: string) => void
  refetchProjectsData: () => void
}

export default function RenameSceneModal({ sceneName, onRenameScene, scene, refetchProjectsData }: Props) {
  const { t } = useTranslation()
  const newSceneName = useHookstate(sceneName)
  const inputError = useHookstate('')

  const handleSubmit = async () => {
    if (!isValidSceneName(newSceneName.value)) {
      inputError.set(t('editor:errors.invalidSceneName'))
      return
    }
    const currentURL = scene.key
    const newURL = currentURL.replace(currentURL.split('/').pop()!, newSceneName.value + '.gltf')
    const newData = await renameScene(scene, newURL, scene.project!)
    refetchProjectsData()

    if (onRenameScene) {
      onRenameScene(newData[0].key)
    }

    PopoverState.hidePopupover()
  }

  return (
    <Modal
      title={t('editor:hierarchy.lbl-renameScene')}
      className="w-[50vw] max-w-2xl"
      onSubmit={handleSubmit}
      onClose={PopoverState.hidePopupover}
      submitButtonDisabled={newSceneName.value === sceneName || inputError.value.length > 0}
    >
      <Input
        value={newSceneName.value}
        onChange={(event) => {
          inputError.set('')
          newSceneName.set(event.target.value)
        }}
        description={t('editor:dialog.saveNewScene.info-name')}
        error={inputError.value}
      />
    </Modal>
  )
}
