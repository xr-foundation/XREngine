
import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { useFind, useRealtime } from '@xrengine/common'
import { StaticResourceType, fileBrowserPath, staticResourcePath } from '@xrengine/common/src/schema.type.module'
import CreateSceneDialog from '@xrengine/editor/src/components/dialogs/CreateScenePanelDialog'
import { confirmSceneSaveIfModified } from '@xrengine/editor/src/components/toolbar/Toolbar'
import { onNewScene } from '@xrengine/editor/src/functions/sceneFunctions'
import { EditorState } from '@xrengine/editor/src/services/EditorServices'
import { getMutableState, useHookstate, useMutableState } from '@xrengine/hyperflux'
import { PanelDragContainer, PanelTitle } from '@xrengine/ui/src/components/editor/layout/Panel'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import LoadingView from '@xrengine/ui/src/primitives/tailwind/LoadingView'
import { TabData } from 'rc-dock'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlinePlusCircle } from 'react-icons/hi2'
import SceneItem from './SceneItem'

function ScenesPanel() {
  const { t } = useTranslation()
  const editorState = useMutableState(EditorState)
  const scenesQuery = useFind(staticResourcePath, {
    query: { project: editorState.projectName.value, type: 'scene', paginate: false }
  })
  const scenes = scenesQuery.data

  const scenesLoading = scenesQuery.status === 'pending'

  const onClickScene = async (scene: StaticResourceType) => {
    if (!(await confirmSceneSaveIfModified())) return

    getMutableState(EditorState).merge({
      scenePath: scene.key
    })
  }

  useRealtime(fileBrowserPath, scenesQuery.refetch)

  const isCreatingScene = useHookstate(false)
  const handleCreateScene = async () => {
    isCreatingScene.set(true)
    const newSceneUIAddons = editorState.uiAddons.newScene.value
    if (Object.keys(newSceneUIAddons).length > 0) {
      PopoverState.showPopupover(<CreateSceneDialog />)
    } else {
      await onNewScene()
    }
    isCreatingScene.set(false)
  }

  return (
    <div className="h-full bg-theme-primary">
      <div className="mb-4 w-full bg-theme-surface-main">
        <Button
          startIcon={<HiOutlinePlusCircle />}
          endIcon={isCreatingScene.value && <LoadingView spinnerOnly className="h-4 w-4" />}
          disabled={isCreatingScene.value}
          rounded="none"
          className="ml-auto bg-theme-highlight px-2"
          size="small"
          onClick={handleCreateScene}
        >
          {t('editor:newScene')}
        </Button>
      </div>
      <div className="h-full bg-theme-primary">
        {scenesLoading ? (
          <LoadingView title={t('editor:loadingScenes')} fullSpace className="block h-12 w-12" />
        ) : (
          <div className="relative h-full flex-1 overflow-y-auto px-4 py-3 pb-8">
            <div className="flex flex-wrap gap-4 pb-8">
              {scenes.map((scene) => (
                <SceneItem
                  key={scene.id}
                  scene={scene}
                  onDeleteScene={() => {
                    if (editorState.sceneAssetID.value === scene.id) {
                      editorState.sceneName.set(null)
                      editorState.sceneAssetID.set(null)
                    }
                  }}
                  onRenameScene={(newName) => {
                    editorState.scenePath.set(newName)
                  }}
                  handleOpenScene={() => onClickScene(scene)}
                  refetchProjectsData={scenesQuery.refetch}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const ScenePanelTitle = () => {
  const { t } = useTranslation()

  return (
    <div>
      <PanelDragContainer>
        <PanelTitle>{t('editor:properties.scene.name')}</PanelTitle>
      </PanelDragContainer>
    </div>
  )
}

export const ScenePanelTab: TabData = {
  id: 'scenePanel',
  closable: true,
  cached: true,
  title: <ScenePanelTitle />,
  content: <ScenesPanel />
}
