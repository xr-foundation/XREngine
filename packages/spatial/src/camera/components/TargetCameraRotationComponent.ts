import { defineComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'

export const TargetCameraRotationComponent = defineComponent({
  name: 'TargetCameraRotationComponent',

  schema: S.Object({
    phi: S.Number(0),
    theta: S.Number(0),
    time: S.Number(0)
  }),

  onInit: (initial) => ({
    ...initial,
    phiVelocity: { value: 0 },
    thetaVelocity: { value: 0 }
  })
})
