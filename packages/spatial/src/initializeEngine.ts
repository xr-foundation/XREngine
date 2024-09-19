
import { BoxGeometry, Group, Mesh, MeshNormalMaterial } from 'three'

import { createEntity, getComponent, removeEntity, setComponent, UUIDComponent } from '@xrengine/ecs'
import { EntityUUID, UndefinedEntity } from '@xrengine/ecs/src/Entity'
import { getMutableState, getState } from '@xrengine/hyperflux'

import { CameraComponent } from './camera/components/CameraComponent'
import { NameComponent } from './common/NameComponent'
import { EngineState } from './EngineState'
import { InputComponent } from './input/components/InputComponent'
import { addObjectToGroup } from './renderer/components/GroupComponent'
import { setObjectLayers } from './renderer/components/ObjectLayerComponent'
import { SceneComponent } from './renderer/components/SceneComponents'
import { VisibleComponent } from './renderer/components/VisibleComponent'
import { ObjectLayers } from './renderer/constants/ObjectLayers'
import { PerformanceManager } from './renderer/PerformanceState'
import { initializeEngineRenderer, RendererComponent } from './renderer/WebGLRendererSystem'
import { EntityTreeComponent } from './transform/components/EntityTree'
import { TransformComponent } from './transform/components/TransformComponent'

export const initializeSpatialViewer = (canvas?: HTMLCanvasElement) => {
  const viewerEntity = createEntity()
  setComponent(viewerEntity, NameComponent, 'viewer')
  setComponent(viewerEntity, UUIDComponent, 'xrengine.viewer' as EntityUUID)
  setComponent(viewerEntity, CameraComponent)
  setComponent(viewerEntity, VisibleComponent, true)
  setComponent(viewerEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
  setComponent(viewerEntity, InputComponent)
  const camera = getComponent(viewerEntity, CameraComponent)
  camera.matrixAutoUpdate = false
  camera.matrixWorldAutoUpdate = false
  camera.layers.disableAll()
  camera.layers.enable(ObjectLayers.Scene)
  camera.layers.enable(ObjectLayers.Avatar)
  camera.layers.enable(ObjectLayers.UI)
  camera.layers.enable(ObjectLayers.TransformGizmo)
  camera.layers.enable(ObjectLayers.UVOL)

  const { originEntity, localFloorEntity } = getState(EngineState)

  if (canvas) {
    setComponent(viewerEntity, RendererComponent, { canvas, scenes: [originEntity, localFloorEntity, viewerEntity] })
    initializeEngineRenderer(viewerEntity)
    PerformanceManager.buildPerformanceState(getComponent(viewerEntity, RendererComponent))
  }

  getMutableState(EngineState).merge({
    viewerEntity
  })
}

export const destroySpatialViewer = () => {
  const { viewerEntity } = getState(EngineState)

  if (viewerEntity) {
    removeEntity(viewerEntity)
  }

  getMutableState(EngineState).merge({
    viewerEntity: UndefinedEntity
  })
}

export const initializeSpatialEngine = () => {
  const originEntity = createEntity()
  setComponent(originEntity, NameComponent, 'origin')
  setComponent(originEntity, UUIDComponent, 'xrengine.origin' as EntityUUID)
  setComponent(originEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
  setComponent(originEntity, TransformComponent)
  setComponent(originEntity, VisibleComponent, true)

  const localFloorEntity = createEntity()
  setComponent(localFloorEntity, NameComponent, 'local floor')
  setComponent(localFloorEntity, UUIDComponent, 'xrengine.local-floor' as EntityUUID)
  setComponent(localFloorEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
  setComponent(localFloorEntity, TransformComponent)
  setComponent(localFloorEntity, VisibleComponent, true)
  setComponent(localFloorEntity, SceneComponent)
  const origin = new Group()
  addObjectToGroup(localFloorEntity, origin)
  const floorHelperMesh = new Mesh(new BoxGeometry(0.1, 0.1, 0.1), new MeshNormalMaterial())
  setObjectLayers(floorHelperMesh, ObjectLayers.Gizmos)
  floorHelperMesh.frustumCulled = false
  origin.add(floorHelperMesh)

  getMutableState(EngineState).merge({
    originEntity,
    localFloorEntity
  })
}

export const destroySpatialEngine = () => {
  const { originEntity, localFloorEntity, viewerEntity } = getState(EngineState)

  if (localFloorEntity) {
    removeEntity(localFloorEntity)
  }
  if (originEntity) {
    removeEntity(originEntity)
  }

  getMutableState(EngineState).merge({
    originEntity: UndefinedEntity,
    localFloorEntity: UndefinedEntity
  })
}
