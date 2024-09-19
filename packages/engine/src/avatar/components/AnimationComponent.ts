import { AnimationClip, AnimationMixer } from 'three'

import { defineComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'

export const AnimationComponent = defineComponent({
  name: 'AnimationComponent',

  schema: S.Object({
    mixer: S.Type<AnimationMixer>(),
    animations: S.Array(S.Type<AnimationClip>())
  })
})
