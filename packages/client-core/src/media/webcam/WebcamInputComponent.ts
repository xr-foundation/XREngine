import { Types } from 'bitecs'

import { defineComponent } from '@xrengine/ecs/src/ComponentFunctions'

export type WebcamInputComponentType = {
  expressionValue: number
  expressionIndex: number
}

export const WebcamInputComponent = defineComponent({
  name: 'WebcamInputComponent',

  schema: {
    expressionValue: Types.f32,
    expressionIndex: Types.ui8
  }
})
