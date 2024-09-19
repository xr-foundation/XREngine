import i18n from 'i18next'

import { createScene } from '@xrengine/client-core/src/world/SceneAPI'
import { API } from '@xrengine/common'
import config from '@xrengine/common/src/config'
import multiLogger from '@xrengine/common/src/logger'
import { staticResourcePath } from '@xrengine/common/src/schema.type.module'
import { cleanString } from '@xrengine/common/src/utils/cleanString'
import { EntityUUID, UUIDComponent, UndefinedEntity } from '@xrengine/ecs'
import { getComponent, setComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { GLTFComponent } from '@xrengine/engine/src/gltf/GLTFComponent'
import { GLTFDocumentState } from '@xrengine/engine/src/gltf/GLTFDocumentState'
import { GLTFSourceState } from '@xrengine/engine/src/gltf/GLTFState'
import { handleScenePaths } from '@xrengine/engine/src/scene/functions/GLTFConversion'
import { getMutableState, getState } from '@xrengine/hyperflux'
import { EngineState } from '@xrengine/spatial/src/EngineState'
import { SceneComponent } from '@xrengine/spatial/src/renderer/components/SceneComponents'
import { EditorState } from '../services/EditorServices'
import { uploadProjectFiles } from './assetFunctions'

const logger = multiLogger.child({ component: 'editor:sceneFunctions' })

const fileServer = config.client.fileServer

export const saveSceneGLTF = async (
  sceneAssetID: string,
  projectName: string,
  sceneFile: string,
  signal: AbortSignal,
  saveAs?: boolean
) => {
  if (signal.aborted) throw new Error(i18n.t('editor:errors.saveProjectAborted'))

  const { rootEntity } = getState(EditorState)
  const sourceID = `${getComponent(rootEntity, UUIDComponent)}-${getComponent(rootEntity, GLTFComponent).src}`

  const sceneName = cleanString(sceneFile!.replace('.scene.json', '').replace('.gltf', ''))
  const currentSceneDirectory = getState(EditorState).scenePath!.split('/').slice(0, -1).join('/')

  if (saveAs) {
    const existingScene = await API.instance.service(staticResourcePath).find({
      query: { key: `${currentSceneDirectory}/${sceneName}.gltf`, $limit: 1 }
    })

    if (existingScene.data.length > 0) throw new Error(i18n.t('editor:errors.sceneAlreadyExists'))
  }

  const gltfData = getState(GLTFDocumentState)[sourceID]
  if (!gltfData) {
    logger.error('Failed to save scene, no gltf data found')
  }
  const encodedGLTF = handleScenePaths(gltfData, 'encode')
  const blob = [JSON.stringify(encodedGLTF, null, 2)]
  const file = new File(blob, `${sceneName}.gltf`)

  const currentScene = await API.instance.service(staticResourcePath).get(sceneAssetID)

  const [[newPath]] = await Promise.all(
    uploadProjectFiles(
      projectName,
      [file],
      [currentSceneDirectory],
      [
        {
          type: 'scene',
          contentType: 'model/gltf+json',
          thumbnailKey: currentScene.thumbnailKey
        }
      ]
    ).promises
  )

  const newURL = new URL(newPath)
  newURL.hash = ''
  newURL.search = ''
  const assetURL = newURL.href.replace(fileServer, '').slice(1) // remove leading slash

  const result = await API.instance.service(staticResourcePath).find({
    query: { key: assetURL, $limit: 1 }
  })

  if (result.total !== 1) {
    throw new Error(i18n.t('editor:errors.sceneSaveFailed'))
  }

  getMutableState(EditorState).merge({
    sceneName,
    scenePath: assetURL,
    projectName,
    sceneAssetID: result.data[0].id
  })
}

export const onNewScene = async (
  templateURL = config.client.fileServer + '/projects/xrengine/default-project/public/scenes/default.gltf'
) => {
  const { projectName } = getState(EditorState)
  if (!projectName) return

  try {
    const sceneData = await createScene(projectName, templateURL)
    if (!sceneData) return
    const sceneName = sceneData.key.split('/').pop()

    getMutableState(EditorState).merge({
      sceneName,
      scenePath: sceneData.key,
      projectName: projectName,
      sceneAssetID: sceneData.id
    })
  } catch (error) {
    logger.error(error)
  }
}

export const setCurrentEditorScene = (sceneURL: string, uuid: EntityUUID) => {
  getMutableState(EngineState).isEditing.set(true)
  const gltfEntity = GLTFSourceState.load(sceneURL, uuid, getState(EngineState).originEntity)
  setComponent(gltfEntity, SceneComponent)
  getMutableState(EditorState).rootEntity.set(gltfEntity)
  return () => {
    getMutableState(EditorState).rootEntity.set(UndefinedEntity)
    GLTFSourceState.unload(gltfEntity)
  }
}
