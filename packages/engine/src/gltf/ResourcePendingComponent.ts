import {
  defineComponent,
  Entity,
  getMutableComponent,
  getOptionalMutableComponent,
  removeComponent,
  setComponent
} from '@xrengine/ecs'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { none } from '@xrengine/hyperflux'

export const ResourcePendingComponent = defineComponent({
  name: 'ResourcePendingComponent',

  schema: S.Record(
    S.String(),
    S.Object({
      progress: S.Number(),
      total: S.Number()
    })
  ),

  setResource(entity: Entity, url: string, progress: number, total: number) {
    setComponent(entity, ResourcePendingComponent)

    const component = getMutableComponent(entity, ResourcePendingComponent)
    component[url].set({ progress, total })
  },

  removeResource(entity: Entity, url: string) {
    const component = getOptionalMutableComponent(entity, ResourcePendingComponent)
    if (!component) return
    if (!component[url].value) return

    component[url].set(none)

    if (!component.keys.length) {
      removeComponent(entity, ResourcePendingComponent)
    }
  }
})
