
import { defineComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'

export const AvatarPendingComponent = defineComponent({
  name: 'AvatarPendingComponent',

  schema: S.Object({
    url: S.String('')
  })
})
