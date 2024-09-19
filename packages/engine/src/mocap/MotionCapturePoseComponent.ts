import { defineComponent } from '@xrengine/ecs/src/ComponentFunctions'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'

const MotionCapturePoses = S.LiteralUnion(['sitting', 'standing'])

export const MotionCapturePoseComponent = defineComponent({
  name: 'MotionCapturePoseComponent',
  schema: S.Record(MotionCapturePoses, S.Object({ begun: S.Bool() }))
})
