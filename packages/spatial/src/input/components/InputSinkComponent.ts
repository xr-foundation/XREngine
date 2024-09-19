
import { defineComponent } from '@xrengine/ecs'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'

/** InputSinkComponent - receives input from input entities.  */
export const InputSinkComponent = defineComponent({
  name: 'InputSinkComponent',
  schema: S.Object({ inputEntities: S.Array(S.Entity()) })
})
