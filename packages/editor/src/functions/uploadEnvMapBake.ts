import { Scene, Vector3 } from 'three'

import { getComponent, hasComponent, setComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Engine } from '@xrengine/ecs/src/Engine'
import { Entity } from '@xrengine/ecs/src/Entity'
import { defineQuery } from '@xrengine/ecs/src/QueryFunctions'
import CubemapCapturer from '@xrengine/engine/src/scene/classes/CubemapCapturer'
import {
  convertCubemapToEquiImageData,
  convertImageDataToKTX2Blob
} from '@xrengine/engine/src/scene/classes/ImageUtils'
import { EnvMapBakeComponent } from '@xrengine/engine/src/scene/components/EnvMapBakeComponent'
import { ScenePreviewCameraComponent } from '@xrengine/engine/src/scene/components/ScenePreviewCamera'
import { getState } from '@xrengine/hyperflux'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import {
  RendererComponent,
  getNestedVisibleChildren,
  getSceneParameters
} from '@xrengine/spatial/src/renderer/WebGLRendererSystem'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'

import { EditorState } from '../services/EditorServices'
import { uploadProjectFiles } from './assetFunctions'

const query = defineQuery([ScenePreviewCameraComponent, TransformComponent])

const getScenePositionForBake = (entity?: Entity) => {
  if (entity) {
    const transformComponent = getComponent(entity, TransformComponent)
    return transformComponent.position
  }
  let entityToBakeFrom: Entity
  entityToBakeFrom = query()[0]

  // fall back somewhere behind the world origin
  if (entityToBakeFrom) {
    const transformComponent = getComponent(entityToBakeFrom, TransformComponent)
    if (transformComponent?.position) return transformComponent.position
  }
  return new Vector3(0, 2, 5)
}

/**
 * Generates and uploads a BPCEM envmap for a specific entity to the current project
 * If the entity provided is the root node for the scene, it will set this as the environment map
 *
 * TODO: make this not the default behavior, instead we want an option in the envmap properties of the scene node,
 *   which will dictate where the envmap is source from see issue #5751
 *
 * @param entity
 * @returns
 */

export const uploadBPCEMBakeToServer = async (entity: Entity) => {
  const isSceneEntity = entity === getState(EditorState).rootEntity

  if (isSceneEntity) {
    if (!hasComponent(entity, EnvMapBakeComponent)) {
      setComponent(entity, EnvMapBakeComponent, { resolution: 1024 })
    }
  }

  const bakeComponent = getComponent(entity, EnvMapBakeComponent)
  const position = getScenePositionForBake(isSceneEntity ? undefined : entity)

  const renderer = getComponent(Engine.instance.viewerEntity, RendererComponent).renderer!

  const scene = new Scene()

  const cubemapCapturer = new CubemapCapturer(renderer, scene, bakeComponent.resolution)
  const renderTarget = cubemapCapturer.update(position)

  if (isSceneEntity) scene.environment = renderTarget.texture

  const envmapImageData = convertCubemapToEquiImageData(
    renderer,
    renderTarget.texture,
    bakeComponent.resolution,
    bakeComponent.resolution
  ) as ImageData

  const envmap = await convertImageDataToKTX2Blob(envmapImageData)

  if (!envmap) return null!

  const nameComponent = getComponent(entity, NameComponent)
  const editorState = getState(EditorState)
  const sceneName = editorState.sceneName!
  const projectName = editorState.projectName!
  const filename = isSceneEntity ? `${sceneName}.envmap.ktx2` : `${sceneName}-${nameComponent.replace(' ', '-')}.ktx2`

  const currentSceneDirectory = getState(EditorState).scenePath!.split('/').slice(0, -1).join('/')
  const url = (
    await uploadProjectFiles(projectName, [new File([envmap], filename)], [currentSceneDirectory]).promises[0]
  )[0]

  const cleanURL = new URL(url)
  cleanURL.hash = ''
  cleanURL.search = ''

  setComponent(entity, EnvMapBakeComponent, { envMapOrigin: cleanURL.href })
}

/** @todo replace resolution with LODs */
export const generateEnvmapBake = (resolution = 2048) => {
  const position = getScenePositionForBake()
  const renderer = getComponent(Engine.instance.viewerEntity, RendererComponent).renderer!

  const rootEntity = getState(EditorState).rootEntity
  const entitiesToRender = getNestedVisibleChildren(rootEntity)
  const sceneData = getSceneParameters(entitiesToRender)
  const scene = new Scene()
  scene.children = sceneData.children
  scene.background = sceneData.background
  scene.fog = sceneData.fog
  scene.environment = sceneData.environment

  const cubemapCapturer = new CubemapCapturer(renderer, scene, resolution)
  const renderTarget = cubemapCapturer.update(position)

  const originalEnvironment = scene.environment
  scene.environment = renderTarget.texture

  const envmapImageData = convertCubemapToEquiImageData(
    renderer,
    renderTarget.texture,
    resolution,
    resolution
  ) as ImageData

  scene.environment = originalEnvironment

  return envmapImageData
}

const resolution = 1024

/**
 * Generates a low res cubemap at a specific position in the world for preview.
 *
 * @param position
 * @returns
 */
export const bakeEnvmapTexture = async (position: Vector3) => {
  const renderer = getComponent(Engine.instance.viewerEntity, RendererComponent).renderer!
  const previewCubemapCapturer = new CubemapCapturer(renderer, new Scene(), resolution)
  const renderTarget = previewCubemapCapturer.update(position)
  const bake = (await convertCubemapToEquiImageData(
    renderer,
    renderTarget.texture,
    resolution,
    resolution
  )) as ImageData
  return bake
}

/**
 * Generates and iploads a high res cubemap at a specific position in the world for saving and export.
 *
 * @param position
 * @returns
 */
export const uploadCubemapBakeToServer = async (name: string, data: ImageData) => {
  const blob = await convertImageDataToKTX2Blob(data)

  if (!blob) return null!

  const editorState = getState(EditorState)
  const sceneName = editorState.sceneName!
  const projectName = editorState.projectName!
  const filename = `${sceneName}-${name.replace(' ', '-')}.ktx2`
  const currentSceneDirectory = getState(EditorState).scenePath!.split('/').slice(0, -1).join('/')
  const urlList = await uploadProjectFiles(projectName, [new File([blob], filename)], [currentSceneDirectory])
    .promises[0]
  const url = urlList[0]

  return url
}
