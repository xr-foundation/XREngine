import { Raycaster, Vector2 } from 'three'

import { Entity, UndefinedEntity } from '@xrengine/ecs'
import { defineState, getMutableState, syncStateWithLocalStorage } from '@xrengine/hyperflux'

export const InputState = defineState({
  name: 'InputState',
  initial: () => ({
    preferredHand: 'right' as 'left' | 'right',
    /** A screenspace raycaster for the pointer */
    pointerScreenRaycaster: new Raycaster(),
    scroll: new Vector2(),
    capturingEntity: UndefinedEntity,
    inputMeshes: new Set([] as Entity[]),
    inputBoundingBoxes: new Set([] as Entity[])
  }),
  extension: syncStateWithLocalStorage(['preferredHand']),
  setCapturingEntity: (entity: Entity, force = false) => {
    const inputState = getMutableState(InputState)
    if (force || inputState.capturingEntity.value === UndefinedEntity) {
      inputState.capturingEntity.set(entity)
    }
  }
})
