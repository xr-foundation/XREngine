
import { Types } from 'bitecs'

import { useEntityContext } from '@xrengine/ecs'
import { defineComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { useLayoutEffect } from 'react'

export const DistanceComponentSchema = { squaredDistance: Types.f32 }

export const DistanceFromLocalClientComponent = defineComponent({
  name: 'DistanceFromLocalClientComponent',
  schema: DistanceComponentSchema
})
export const DistanceFromCameraComponent = defineComponent({
  name: 'DistanceFromCameraComponent',
  schema: DistanceComponentSchema
})

export const FrustumCullCameraSchema = { isCulled: Types.ui8 }
export const FrustumCullCameraComponent = defineComponent({
  name: 'FrustumCullCameraComponent',
  schema: FrustumCullCameraSchema,

  reactor: () => {
    const entity = useEntityContext()
    useLayoutEffect(() => {
      return () => {
        // reset upon removing the component
        FrustumCullCameraComponent.isCulled[entity] = 0
      }
    }, [])
  }
})

export const compareDistanceToCamera = (a: Entity, b: Entity) => {
  const aDist = DistanceFromCameraComponent.squaredDistance[a]
  const bDist = DistanceFromCameraComponent.squaredDistance[b]
  return aDist - bDist
}

export const compareDistanceToLocalClient = (a: Entity, b: Entity) => {
  const aDist = DistanceFromLocalClientComponent.squaredDistance[a]
  const bDist = DistanceFromLocalClientComponent.squaredDistance[b]
  return aDist - bDist
}
