
import { defineComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'

export const AvatarArmsTwistCorrectionComponent = defineComponent({
  name: 'AvatarArmsTwistCorrectionComponent',

  schema: S.Object({
    LeftHandBindRotationInv: S.Quaternion(),
    LeftArmTwistAmount: S.Number(0),
    RightHandBindRotationInv: S.Quaternion(),
    RightArmTwistAmount: S.Number(0)
  })
})
