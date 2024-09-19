import { NotificationService } from '@xrengine/client-core/src/common/services/NotificationService'
import { useEngineCanvas } from '@xrengine/client-core/src/hooks/useEngineCanvas'
import useFeatureFlags from '@xrengine/client-core/src/hooks/useFeatureFlags'
import { uploadToFeathersService } from '@xrengine/client-core/src/util/upload'
import { useFind } from '@xrengine/common'
import { FeatureFlags } from '@xrengine/common/src/constants/FeatureFlags'
import { clientSettingPath, fileBrowserUploadPath } from '@xrengine/common/src/schema.type.module'
import { processFileName } from '@xrengine/common/src/utils/processFileName'
import { useComponent, useQuery } from '@xrengine/ecs'
import { GLTFComponent } from '@xrengine/engine/src/gltf/GLTFComponent'
import { ResourcePendingComponent } from '@xrengine/engine/src/gltf/ResourcePendingComponent'
import { useMutableState } from '@xrengine/hyperflux'
import { TransformComponent } from '@xrengine/spatial'
import { PanelDragContainer, PanelTitle } from '@xrengine/ui/src/components/editor/layout/Panel'
import LoadingView from '@xrengine/ui/src/primitives/tailwind/LoadingView'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'
import { TabData } from 'rc-dock'
import React from 'react'
import { useDrop } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { Vector2, Vector3 } from 'three'
import { DnDFileType, FileDataType, ItemTypes, SceneElementType, SupportedFileTypes } from '../../constants/AssetTypes'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { addMediaNode } from '../../functions/addMediaNode'
import { getCursorSpawnPosition } from '../../functions/screenSpaceFunctions'
import { EditorState } from '../../services/EditorServices'
import GizmoTool from './tools/GizmoTool'
import GridTool from './tools/GridTool'
import PlayModeTool from './tools/PlayModeTool'
import RenderModeTool from './tools/RenderTool'
import SceneHelpersTool from './tools/SceneHelpersTool'
import TransformPivotTool from './tools/TransformPivotTool'
import TransformSnapTool from './tools/TransformSnapTool'
import TransformSpaceTool from './tools/TransformSpaceTool'

const ViewportDnD = ({ children }: { children: React.ReactNode }) => {
  const projectName = useMutableState(EditorState).projectName

  const [{ isDragging }, dropRef] = useDrop({
    accept: [ItemTypes.Component, ...SupportedFileTypes],
    collect: (monitor) => ({
      isDragging: monitor.getItem() !== null && monitor.canDrop() && monitor.isOver()
    }),
    drop(item: SceneElementType | FileDataType | DnDFileType, monitor) {
      const vec3 = new Vector3()
      getCursorSpawnPosition(monitor.getClientOffset() as Vector2, vec3)
      if ('componentJsonID' in item) {
        EditorControlFunctions.createObjectFromSceneElement([
          { name: item.componentJsonID },
          { name: TransformComponent.jsonID, props: { position: vec3 } }
        ])
      } else if ('url' in item) {
        addMediaNode(item.url, undefined, undefined, [{ name: TransformComponent.jsonID, props: { position: vec3 } }])
      } else if ('files' in item) {
        const dropDataTransfer: DataTransfer = monitor.getItem()

        Promise.all(
          Array.from(dropDataTransfer.files).map(async (file) => {
            try {
              const name = processFileName(file.name)
              return uploadToFeathersService(fileBrowserUploadPath, [file], {
                args: [
                  {
                    project: projectName.value,
                    path: `assets/` + name,
                    contentType: file.type
                  }
                ]
              }).promise as Promise<string[]>
            } catch (err) {
              NotificationService.dispatchNotify(err.message, { variant: 'error' })
            }
          })
        ).then((urls) => {
          const vec3 = new Vector3()
          urls.forEach((url) => {
            if (!url || url.length < 1 || !url[0] || url[0] === '') return
            addMediaNode(url[0], undefined, undefined, [{ name: TransformComponent.jsonID, props: { position: vec3 } }])
          })
        })
      }
    }
  })

  return (
    <div
      ref={dropRef}
      className={twMerge('h-full w-full border border-white', isDragging ? 'border-4' : 'border-none')}
    >
      {children}
    </div>
  )
}

const SceneLoadingProgress = ({ rootEntity }) => {
  const { t } = useTranslation()
  const progress = useComponent(rootEntity, GLTFComponent).progress.value
  const loaded = GLTFComponent.useSceneLoaded(rootEntity)
  const resourcePendingQuery = useQuery([ResourcePendingComponent])

  if (loaded) return null

  return (
    <LoadingView
      fullSpace
      className="block h-12 w-12"
      containerClassName="absolute bg-black bg-opacity-70"
      title={t('editor:loadingScenesWithProgress', { progress, assetsLeft: resourcePendingQuery.length })}
    />
  )
}

function ViewportContainer() {
  const { sceneName, rootEntity } = useMutableState(EditorState)

  const { t } = useTranslation()
  const clientSettingQuery = useFind(clientSettingPath)
  const clientSettings = clientSettingQuery.data[0]

  const ref = React.useRef<HTMLDivElement>(null)
  const toolbarRef = React.useRef<HTMLDivElement>(null)

  useEngineCanvas(ref)

  const [transformPivotFeatureFlag] = useFeatureFlags([FeatureFlags.Studio.UI.TransformPivot])

  return (
    <ViewportDnD>
      <div className="relative z-30 flex h-full w-full flex-col">
        <div ref={toolbarRef} className="z-10 flex gap-1 bg-theme-studio-surface p-1">
          <TransformSpaceTool />
          {transformPivotFeatureFlag && <TransformPivotTool />}
          <GridTool />
          <TransformSnapTool />
          <SceneHelpersTool />
          <div className="flex-1" />
          <RenderModeTool />
          <PlayModeTool />
        </div>
        {sceneName.value ? <GizmoTool viewportRef={ref} toolbarRef={toolbarRef} /> : null}
        {sceneName.value ? (
          <>
            <div id="engine-renderer-canvas-container" ref={ref} className="absolute h-full w-full" />
            {rootEntity.value && <SceneLoadingProgress key={rootEntity.value} rootEntity={rootEntity.value} />}
          </>
        ) : (
          <div className="flex h-full w-full flex-col justify-center gap-2">
            <img src={clientSettings?.appTitle} className="block scale-[.8]" />
            <Text className="text-center">{t('editor:selectSceneMsg')}</Text>
          </div>
        )}
      </div>
    </ViewportDnD>
  )
}

export const ViewportPanelTitle = () => {
  const { t } = useTranslation()

  return (
    <PanelDragContainer>
      <PanelTitle>{t('editor:viewport.title')}</PanelTitle>
    </PanelDragContainer>
  )
}

export const ViewportPanelTab: TabData = {
  id: 'viewPanel',
  closable: true,
  title: <ViewportPanelTitle />,
  content: <ViewportContainer />
}
