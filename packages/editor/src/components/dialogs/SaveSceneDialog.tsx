

import { NotificationService } from '@xrengine/client-core/src/common/services/NotificationService'
import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import isValidSceneName from '@xrengine/common/src/utils/validateSceneName'
import { getComponent } from '@xrengine/ecs'
import { GLTFModifiedState } from '@xrengine/engine/src/gltf/GLTFDocumentState'
import { SourceComponent } from '@xrengine/engine/src/scene/components/SourceComponent'
import { getMutableState, getState, none, useHookstate } from '@xrengine/hyperflux'
import ConfirmDialog from '@xrengine/ui/src/components/tailwind/ConfirmDialog'
import ErrorDialog from '@xrengine/ui/src/components/tailwind/ErrorDialog'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import Modal from '@xrengine/ui/src/primitives/tailwind/Modal'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { saveSceneGLTF } from '../../functions/sceneFunctions'
import { EditorState } from '../../services/EditorServices'

export const SaveSceneDialog = (props: { isExiting?: boolean; onConfirm?: () => void; onCancel?: () => void }) => {
  const { t } = useTranslation()
  const modalProcessing = useHookstate(false)

  const handleSubmit = async () => {
    modalProcessing.set(true)
    const { sceneAssetID, projectName, sceneName, rootEntity } = getState(EditorState)
    const sceneModified = EditorState.isModified()

    if (!projectName) {
      PopoverState.hidePopupover()
      if (props.onCancel) props.onCancel()
      return
    } else if (!sceneName) {
      PopoverState.hidePopupover()
      PopoverState.showPopupover(<SaveNewSceneDialog onConfirm={props.onConfirm} onCancel={props.onCancel} />)
      return
    } else if (!sceneModified) {
      PopoverState.hidePopupover()
      if (props.onCancel) props.onCancel()
      NotificationService.dispatchNotify(t('editor:dialog.saveScene.info-save-success'), { variant: 'success' })
      return
    }

    const abortController = new AbortController()

    try {
      await saveSceneGLTF(sceneAssetID!, projectName, sceneName, abortController.signal)
      NotificationService.dispatchNotify(t('editor:dialog.saveScene.info-save-success'), { variant: 'success' })
      const sourceID = getComponent(rootEntity, SourceComponent)
      getMutableState(GLTFModifiedState)[sourceID].set(none)

      PopoverState.hidePopupover()
      if (props.onConfirm) props.onConfirm()
    } catch (error) {
      console.error(error)
      PopoverState.showPopupover(
        <ErrorDialog title={t('editor:savingError')} description={error.message || t('editor:savingErrorMsg')} />
      )
      if (props.onCancel) props.onCancel()
    }
    modalProcessing.set(false)
  }

  return (
    <ConfirmDialog
      title={props.isExiting ? t('editor:dialog.saveScene.unsavedChanges.title') : t('editor:dialog.saveScene.title')}
      onSubmit={handleSubmit}
      onClose={() => {
        PopoverState.hidePopupover()
        if (props.onCancel) props.onCancel()
      }}
      text={props.isExiting ? t('editor:dialog.saveScene.info-question') : t('editor:dialog.saveScene.info-confirm')}
    />
  )
}

export const SaveNewSceneDialog = (props: { onConfirm?: () => void; onCancel?: () => void }) => {
  const { t } = useTranslation()
  const inputSceneName = useHookstate('New-Scene')
  const modalProcessing = useHookstate(false)
  const inputError = useHookstate('')

  const handleSubmit = async () => {
    if (!isValidSceneName(inputSceneName.value)) {
      inputError.set(t('editor:errors.invalidSceneName'))
      return
    }

    modalProcessing.set(true)
    const { projectName, sceneName, rootEntity, sceneAssetID } = getState(EditorState)
    const sceneModified = EditorState.isModified()
    const abortController = new AbortController()
    try {
      if (sceneName || sceneModified) {
        if (inputSceneName.value && projectName) {
          await saveSceneGLTF(sceneAssetID!, projectName, inputSceneName.value, abortController.signal, true)

          const sourceID = getComponent(rootEntity, SourceComponent)
          getMutableState(GLTFModifiedState)[sourceID].set(none)
        }
      }
      PopoverState.hidePopupover()
      if (props.onConfirm) props.onConfirm()
    } catch (error) {
      PopoverState.hidePopupover()
      if (props.onCancel) props.onCancel()
      console.error(error)
      PopoverState.showPopupover(
        <ErrorDialog title={t('editor:savingError')} description={error?.message || t('editor:savingErrorMsg')} />
      )
    }
    modalProcessing.set(false)
  }

  return (
    <Modal
      title={t('editor:dialog.saveNewScene.title')}
      onClose={() => {
        PopoverState.hidePopupover()
        if (props.onCancel) props.onCancel()
      }}
      onSubmit={handleSubmit}
      className="w-[50vw] max-w-2xl"
      submitLoading={modalProcessing.value}
      submitButtonDisabled={inputError.value.length > 0}
    >
      <Input
        value={inputSceneName.value}
        onChange={(event) => {
          inputError.set('')
          inputSceneName.set(event.target.value)
        }}
        label={t('editor:dialog.saveNewScene.lbl-name')}
        description={t('editor:dialog.saveNewScene.info-name')}
        error={inputError.value}
      />
    </Modal>
  )
}
