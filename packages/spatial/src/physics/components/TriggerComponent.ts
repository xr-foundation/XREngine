
import { defineComponent } from '@xrengine/ecs'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'

export const TriggerComponent = defineComponent({
  name: 'TriggerComponent',
  jsonID: 'XRENGINE_trigger',

  schema: S.Object({
    triggers: S.Array(
      S.Object({
        /**
         * The function to call on the CallbackComponent of the targetEntity when the trigger volume is entered.
         */
        onEnter: S.Nullable(S.String()),
        /**
         * The function to call on the CallbackComponent of the targetEntity when the trigger volume is exited.
         */
        onExit: S.Nullable(S.String()),
        /**
         * empty string represents self
         */
        target: S.Nullable(S.EntityUUID())
      })
    )
  })
})
