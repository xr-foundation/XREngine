
import { defineComponent } from '@xrengine/ecs'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
export const LookAtComponent = defineComponent({
  name: 'LookAtComponent',
  jsonID: 'IR_lookAt',

  schema: S.Object({
    target: S.Nullable(S.EntityUUID()),
    xAxis: S.Bool(true),
    yAxis: S.Bool(true)
  })
})
