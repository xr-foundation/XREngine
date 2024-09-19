
import { useEffect } from 'react'
import { Color, DoubleSide, Mesh, MeshBasicMaterial, SphereGeometry } from 'three'

import { getComponent, removeComponent, setComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { ECSState } from '@xrengine/ecs/src/ECSState'
import { Engine } from '@xrengine/ecs/src/Engine'
import { Entity } from '@xrengine/ecs/src/Entity'
import { createEntity, entityExists, removeEntity } from '@xrengine/ecs/src/EntityFunctions'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { defineActionQueue, defineState, getMutableState, getState, useMutableState } from '@xrengine/hyperflux'

import React from 'react'
import { EngineState } from '../../EngineState'
import { NameComponent } from '../../common/NameComponent'
import { createTransitionState } from '../../common/functions/createTransitionState'
import { addObjectToGroup } from '../../renderer/components/GroupComponent'
import { setObjectLayers } from '../../renderer/components/ObjectLayerComponent'
import { setVisibleComponent } from '../../renderer/components/VisibleComponent'
import { ObjectLayers } from '../../renderer/constants/ObjectLayers'
import { ComputedTransformComponent } from '../../transform/components/ComputedTransformComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CameraActions } from '../CameraState'
import { CameraSystem } from './CameraSystem'

const fadeToBlackQueue = defineActionQueue(CameraActions.fadeToBlack.matches)

const CameraFadeBlackEffectSystemState = defineState({
  name: 'CameraFadeBlackEffectSystemState',
  initial: {} as {
    transition: ReturnType<typeof createTransitionState>
    mesh: Mesh<SphereGeometry, MeshBasicMaterial>
    entity: Entity
  }
})

const execute = () => {
  const { transition, mesh, entity } = getState(CameraFadeBlackEffectSystemState)
  if (!entity) return

  for (const action of fadeToBlackQueue()) {
    transition.setState(action.in ? 'IN' : 'OUT')
    if (action.in) {
      setComponent(entity, ComputedTransformComponent, {
        referenceEntities: [Engine.instance.cameraEntity],
        computeFunction: () => {
          getComponent(entity, TransformComponent).position.copy(
            getComponent(Engine.instance.cameraEntity, TransformComponent).position
          )
        }
      })
    } else removeComponent(entity, ComputedTransformComponent)

    mesh.material.color = new Color('black')
    mesh.material.map = null
    mesh.material.needsUpdate = true
  }

  const deltaSeconds = getState(ECSState).deltaSeconds
  transition.update(deltaSeconds, (alpha) => {
    mesh.material.opacity = alpha
    setVisibleComponent(entity, alpha > 0)
  })
}

const Reactor = () => {
  useEffect(() => {
    const geometry = new SphereGeometry(10)
    const material = new MeshBasicMaterial({
      transparent: true,
      side: DoubleSide,
      depthWrite: true,
      depthTest: false
    })

    const mesh = new Mesh(geometry, material)
    mesh.layers.set(ObjectLayers.Camera)
    mesh.scale.set(-1, 1, -1)
    mesh.name = 'Camera Fade Transition'
    const entity = createEntity()
    setComponent(entity, NameComponent, mesh.name)
    addObjectToGroup(entity, mesh)
    mesh.renderOrder = 1
    setObjectLayers(mesh, ObjectLayers.Camera)
    const transition = createTransitionState(0.25, 'OUT')

    getMutableState(CameraFadeBlackEffectSystemState).set({
      transition,
      mesh,
      entity
    })

    return () => {
      if (entityExists(entity)) removeEntity(entity)
      getMutableState(CameraFadeBlackEffectSystemState).set({} as any)
    }
  }, [])

  return null
}

export const CameraFadeBlackEffectSystem = defineSystem({
  uuid: 'xrengine.engine.CameraFadeBlackEffectSystem',
  insert: { with: CameraSystem },
  execute,
  reactor: () => {
    if (!useMutableState(EngineState).viewerEntity.value) return null
    return <Reactor />
  }
})
