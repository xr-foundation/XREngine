
import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { staticResourcePath } from '@xrengine/common/src/schema.type.module'
import { NO_PROXY, getMutableState, useHookstate, useMutableState } from '@xrengine/hyperflux'
import { AssetsPanelTab } from '@xrengine/ui/src/components/editor/panels/Assets'
import { PropertiesPanelTab } from '@xrengine/ui/src/components/editor/panels/Properties'
import { VisualScriptPanelTab } from '@xrengine/ui/src/components/editor/panels/VisualScript'

import ErrorDialog from '@xrengine/ui/src/components/tailwind/ErrorDialog'
import PopupMenu from '@xrengine/ui/src/primitives/tailwind/PopupMenu'
import { t } from 'i18next'
import { DockLayout, DockMode, LayoutData } from 'rc-dock'
import React, { useEffect, useRef } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import Toolbar from '../components/toolbar/Toolbar'
import { cmdOrCtrlString } from '../functions/utils'
import { EditorErrorState } from '../services/EditorErrorServices'
import { EditorState } from '../services/EditorServices'
import { SelectionState } from '../services/SelectionServices'
import { SaveSceneDialog } from './dialogs/SaveSceneDialog'
import { DndWrapper } from './dnd/DndWrapper'
import DragLayer from './dnd/DragLayer'

import useFeatureFlags from '@xrengine/client-core/src/hooks/useFeatureFlags'
import { useZendesk } from '@xrengine/client-core/src/hooks/useZendesk'
import { API } from '@xrengine/common'
import { FeatureFlags } from '@xrengine/common/src/constants/FeatureFlags'
import { EntityUUID } from '@xrengine/ecs'
import { EngineState } from '@xrengine/spatial/src/EngineState'
import { destroySpatialEngine, initializeSpatialEngine } from '@xrengine/spatial/src/initializeEngine'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import 'rc-dock/dist/rc-dock.css'
import { useTranslation } from 'react-i18next'
import { IoHelpCircleOutline } from 'react-icons/io5'
import { setCurrentEditorScene } from '../functions/sceneFunctions'
import { FilesPanelTab } from '../panels/files'
import { HierarchyPanelTab } from '../panels/hierarchy'
import { MaterialsPanelTab } from '../panels/materials'
import { ScenePanelTab } from '../panels/scenes'
import { ViewportPanelTab } from '../panels/viewport'
import './EditorContainer.css'

export const DockContainer = ({ children, id = 'editor-dock', dividerAlpha = 0 }) => {
  const dockContainerStyles = {
    '--dividerAlpha': dividerAlpha
  }

  return (
    <div id={id} className="dock-container" style={dockContainerStyles as React.CSSProperties}>
      {children}
    </div>
  )
}

const onEditorError = (error) => {
  console.error(error)
  if (error['aborted']) {
    PopoverState.hidePopupover()
    return
  }

  PopoverState.showPopupover(
    <ErrorDialog title={error.title || t('editor:error')} description={error.message || t('editor:errorMsg')} />
  )
}

const defaultLayout = (flags: { visualScriptPanelEnabled: boolean }): LayoutData => {
  const tabs = [ScenePanelTab, FilesPanelTab, AssetsPanelTab]
  flags.visualScriptPanelEnabled && tabs.push(VisualScriptPanelTab)

  return {
    dockbox: {
      mode: 'horizontal' as DockMode,
      children: [
        {
          mode: 'vertical' as DockMode,
          size: 8,
          children: [
            {
              tabs: [ViewportPanelTab]
            },
            {
              tabs: tabs
            }
          ]
        },
        {
          mode: 'vertical' as DockMode,
          size: 3,
          children: [
            {
              tabs: [HierarchyPanelTab, MaterialsPanelTab]
            },
            {
              tabs: [PropertiesPanelTab]
            }
          ]
        }
      ]
    }
  }
}

const EditorContainer = () => {
  const { sceneAssetID, sceneName, projectName, scenePath, uiEnabled, uiAddons } = useMutableState(EditorState)

  const currentLoadedSceneURL = useHookstate(null as string | null)

  /**
   * what is our source of truth for which scene is loaded?
   *      EditorState.scenePath
   * because we DO NOT want url hashes to trigger a scene reload
   */

  /** we don't want to use useFind here, because we don't want all static-resource query refetches to potentially reload the scene */
  useEffect(() => {
    if (!scenePath.value) return

    const abortController = new AbortController()
    API.instance
      .service(staticResourcePath)
      .find({
        query: { key: scenePath.value, type: 'scene', $limit: 1 }
      })
      .then((result) => {
        if (abortController.signal.aborted) return

        const scene = result.data[0]
        if (!scene) {
          console.error('Scene not found')
          sceneName.set(null)
          sceneAssetID.set(null)
          currentLoadedSceneURL.set(null)
          return
        }

        projectName.set(scene.project!)
        sceneName.set(scene.key.split('/').pop() ?? null)
        sceneAssetID.set(scene.id)
        currentLoadedSceneURL.set(scene.url)
      })

    return () => {
      abortController.abort()
    }
  }, [scenePath.value])

  useEffect(() => {
    initializeSpatialEngine()
    return () => {
      destroySpatialEngine()
    }
  }, [])

  const originEntity = useMutableState(EngineState).originEntity.value

  useEffect(() => {
    if (!sceneAssetID.value || !currentLoadedSceneURL.value || !originEntity) return
    return setCurrentEditorScene(currentLoadedSceneURL.value, sceneAssetID.value as EntityUUID)
  }, [originEntity, currentLoadedSceneURL.value])

  const errorState = useHookstate(getMutableState(EditorErrorState).error)

  const dockPanelRef = useRef<DockLayout>(null)

  useHotkeys(`${cmdOrCtrlString}+s`, (e) => {
    e.preventDefault()
    PopoverState.showPopupover(<SaveSceneDialog />)
  })

  const { initialized, isWidgetVisible, openChat } = useZendesk()
  const { t } = useTranslation()

  const [visualScriptPanelEnabled] = useFeatureFlags([FeatureFlags.Studio.Panel.VisualScript])

  useEffect(() => {
    return () => {
      getMutableState(SelectionState).selectedEntities.set([])
    }
  }, [scenePath])

  useEffect(() => {
    if (errorState.value) {
      onEditorError(errorState.value)
    }
  }, [errorState])

  useEffect(() => {
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      if (EditorState.isModified()) {
        event.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  return (
    <main className="pointer-events-auto">
      <div
        id="editor-container"
        className="flex flex-col bg-black"
        style={scenePath.value ? { background: 'transparent' } : {}}
      >
        {uiEnabled.value && (
          <DndWrapper id="editor-container">
            <DragLayer />
            <Toolbar />
            <div className="mt-1 flex overflow-hidden">
              <DockContainer>
                <DockLayout
                  ref={dockPanelRef}
                  defaultLayout={defaultLayout({ visualScriptPanelEnabled })}
                  style={{ position: 'absolute', left: 5, top: 45, right: 5, bottom: 5 }}
                />
              </DockContainer>
            </div>
          </DndWrapper>
        )}
        {Object.entries(uiAddons.container.get(NO_PROXY)).map(([key, value]) => {
          return value
        })}
      </div>
      <PopupMenu />
      {!isWidgetVisible && initialized && (
        <Button
          rounded="partial"
          size="small"
          className="absolute bottom-5 right-5 z-10"
          startIcon={<IoHelpCircleOutline fontSize={20} />}
          onClick={openChat}
        >
          {t('editor:help')}
        </Button>
      )}
    </main>
  )
}

export default EditorContainer
