import { defineComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'

export const FlyControlComponent = defineComponent({
  name: 'FlyControlComponent',

  schema: S.Object({
    moveSpeed: S.Number(1),
    boostSpeed: S.Number(1),
    lookSensitivity: S.Number(1),
    maxXRotation: S.Number(Math.PI / 2)
  })
})
