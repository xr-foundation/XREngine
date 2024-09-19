import { defineComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'

export const SittingComponent = defineComponent({
  name: 'SittingComponent',

  schema: S.Object({
    mountPointEntity: S.Entity()
  })
})
