
import { defineComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'

export const DropShadowComponent = defineComponent({
  name: 'DropShadowComponent',

  schema: S.Object({
    radius: S.Number(0),
    center: S.Vec3(),
    entity: S.Entity()
  })
})
