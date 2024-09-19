
import { Tween } from '@tweenjs/tween.js'

import { defineComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'

export const TweenComponent = defineComponent({
  name: 'TweenComponent',
  schema: S.Type<Tween<any>>()
})
