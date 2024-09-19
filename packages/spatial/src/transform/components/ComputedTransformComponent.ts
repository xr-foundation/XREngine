
import { matches } from 'ts-matches'

import { defineComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { useImmediateEffect } from '@xrengine/hyperflux'
import { TransformComponent } from './TransformComponent'

export const ComputedTransformComponent = defineComponent({
  name: 'ComputedTransformComponent',

  schema: S.Object({
    referenceEntities: S.Array(S.Entity()),
    computeFunction: S.Call()
  }),

  onSet(entity, component, json) {
    if (!json) return

    matches.arrayOf(matches.number).test(json.referenceEntities) &&
      component.referenceEntities.set(json.referenceEntities)
    if (typeof json.computeFunction === 'function') component.merge({ computeFunction: json.computeFunction })
  },

  reactor: () => {
    useImmediateEffect(() => {
      TransformComponent.transformsNeedSorting = true
    }, [])
    return null
  }
})
