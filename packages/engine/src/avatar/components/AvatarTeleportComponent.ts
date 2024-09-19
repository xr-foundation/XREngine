
import { defineComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { XRHandedness } from '../../interaction/components/GrabbableComponent'

export const AvatarTeleportComponent = defineComponent({
  name: 'AvatarTeleportComponent',

  schema: S.Object({
    side: XRHandedness
  })
})
