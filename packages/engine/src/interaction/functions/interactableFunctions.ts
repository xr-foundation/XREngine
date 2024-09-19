import { Frustum, Matrix4, Vector3 } from 'three'

import { getComponent, getOptionalComponent } from '@xrengine/ecs'
import { Entity } from '@xrengine/ecs/src/Entity'
import { defineState, getMutableState, getState } from '@xrengine/hyperflux'
import { TransformComponent } from '@xrengine/spatial'
import { CameraComponent } from '@xrengine/spatial/src/camera/components/CameraComponent'
import { createTransitionState } from '@xrengine/spatial/src/common/functions/createTransitionState'
import {
  DistanceFromLocalClientComponent,
  compareDistanceToLocalClient
} from '@xrengine/spatial/src/transform/components/DistanceComponents'

import { EngineState } from '@xrengine/spatial/src/EngineState'
import { InteractableComponent } from '../components/InteractableComponent'

const worldPosVec3 = new Vector3()
const mat4 = new Matrix4()
const frustum = new Frustum()

/**
 * Checks if entity is in range based on its own threshold
 * @param entity
 * @constructor
 */
const inRangeAndFrustumToInteract = (entity: Entity): boolean => {
  const interactable = getOptionalComponent(entity, InteractableComponent)
  if (!interactable) return false
  const maxDistanceSquare = interactable.activationDistance * interactable.activationDistance
  let inRangeAndFrustum = DistanceFromLocalClientComponent.squaredDistance[entity] < maxDistanceSquare
  if (inRangeAndFrustum) {
    inRangeAndFrustum = inFrustum(entity)
  }
  return inRangeAndFrustum
}

export const InteractableState = defineState({
  name: 'InteractableState',
  initial: () => {
    return {
      /**
       * all interactables within threshold range, in view of the camera, sorted by distance
       */
      available: [] as Entity[]
    }
  }
})

export const inFrustum = (entity: Entity): boolean => {
  TransformComponent.getWorldPosition(entity, worldPosVec3)
  return frustum.containsPoint(worldPosVec3)
}

/**
 * Checks if entity can interact with any of entities listed in 'interactable' array, checking distance, guards and raycast
 * sorts the interactables by closest to the player
 * @param {Entity[]} interactables
 */
export const gatherAvailableInteractables = (interactables: Entity[]) => {
  const availableInteractable = getMutableState(InteractableState).available

  const viewerEntity = getState(EngineState).viewerEntity
  if (!viewerEntity) return

  const camera = getComponent(viewerEntity, CameraComponent)

  mat4.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
  frustum.setFromProjectionMatrix(mat4)

  availableInteractable.set(
    [...interactables].filter((entity) => inRangeAndFrustumToInteract(entity)).sort(compareDistanceToLocalClient)
  )
}

export const InteractableTransitions = new Map<Entity, ReturnType<typeof createTransitionState>>()
