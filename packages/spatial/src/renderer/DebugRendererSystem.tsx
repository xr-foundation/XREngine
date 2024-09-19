import React, { useEffect } from 'react'
import { BufferAttribute, BufferGeometry, LineBasicMaterial, LineSegments } from 'three'

import { Entity, EntityUUID, QueryReactor, UUIDComponent } from '@xrengine/ecs'
import { getComponent, setComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { getMutableState, getState, useMutableState } from '@xrengine/hyperflux'

import { NameComponent } from '../common/NameComponent'
import { EngineState } from '../EngineState'
import { RapierWorldState } from '../physics/classes/Physics'
import { addObjectToGroup, GroupComponent } from '../renderer/components/GroupComponent'
import { setObjectLayers } from '../renderer/components/ObjectLayerComponent'
import { setVisibleComponent } from '../renderer/components/VisibleComponent'
import { ObjectLayers } from '../renderer/constants/ObjectLayers'
import { RendererState } from '../renderer/RendererState'
import { WebGLRendererSystem } from '../renderer/WebGLRendererSystem'
import { EntityTreeComponent } from '../transform/components/EntityTree'
import { createInfiniteGridHelper } from './components/InfiniteGridHelper'
import { SceneComponent } from './components/SceneComponents'

const PhysicsDebugEntities = new Map<EntityUUID, Entity>()

const execute = () => {
  for (const [id, physicsDebugEntity] of Array.from(PhysicsDebugEntities)) {
    const world = getState(RapierWorldState)[id]
    if (!world) continue
    const lineSegments = getComponent(physicsDebugEntity, GroupComponent)[0] as any as LineSegments
    const debugRenderBuffer = world.debugRender()
    lineSegments.geometry.setAttribute('position', new BufferAttribute(debugRenderBuffer.vertices, 3))
    lineSegments.geometry.setAttribute('color', new BufferAttribute(debugRenderBuffer.colors, 4))
  }
}

const PhysicsReactor = () => {
  const entity = useEntityContext()
  const uuid = useComponent(entity, UUIDComponent).value
  const engineRendererSettings = useMutableState(RendererState)

  useEffect(() => {
    /** @todo move physics debug to physics module */
    if (!engineRendererSettings.physicsDebug.value) return

    const lineMaterial = new LineBasicMaterial({ vertexColors: true })
    const lineSegments = new LineSegments(new BufferGeometry(), lineMaterial)
    lineSegments.frustumCulled = false

    const lineSegmentsEntity = createEntity()
    setComponent(lineSegmentsEntity, NameComponent, 'Physics Debug')
    setVisibleComponent(lineSegmentsEntity, true)
    addObjectToGroup(lineSegmentsEntity, lineSegments)

    setComponent(lineSegmentsEntity, EntityTreeComponent, { parentEntity: entity })

    setObjectLayers(lineSegments, ObjectLayers.PhysicsHelper)
    PhysicsDebugEntities.set(uuid, lineSegmentsEntity)

    return () => {
      removeEntity(lineSegmentsEntity)
      PhysicsDebugEntities.delete(uuid)
    }
  }, [engineRendererSettings.physicsDebug, uuid])

  return null
}

const reactor = () => {
  const engineRendererSettings = useMutableState(RendererState)
  const originEntity = useMutableState(EngineState).originEntity.value

  useEffect(() => {
    if (!engineRendererSettings.gridVisibility.value || !originEntity) return

    const infiniteGridHelperEntity = createInfiniteGridHelper()
    setComponent(infiniteGridHelperEntity, EntityTreeComponent, { parentEntity: originEntity })
    getMutableState(RendererState).infiniteGridHelperEntity.set(infiniteGridHelperEntity)
    return () => {
      removeEntity(infiniteGridHelperEntity)
      getMutableState(RendererState).infiniteGridHelperEntity.set(null)
    }
  }, [originEntity, engineRendererSettings.gridVisibility])

  return (
    <>
      <QueryReactor Components={[SceneComponent]} ChildEntityReactor={PhysicsReactor} />
    </>
  )
}

export const DebugRendererSystem = defineSystem({
  uuid: 'xrengine.engine.DebugRendererSystem',
  insert: { before: WebGLRendererSystem },
  execute,
  reactor
})
