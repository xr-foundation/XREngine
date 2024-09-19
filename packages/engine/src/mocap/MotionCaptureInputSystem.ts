
import { defineQuery } from '@xrengine/ecs'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { InputSystemGroup } from '@xrengine/ecs/src/SystemGroups'

import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { AvatarControllerComponent } from '../avatar/components/AvatarControllerComponent'
import { MotionCaptureRigComponent } from './MotionCaptureRigComponent'
import { evaluatePose } from './poseToInput'

const motionCapturePoseQuery = defineQuery([MotionCaptureRigComponent, AvatarRigComponent, AvatarControllerComponent])

export const execute = () => {
  for (const entity of motionCapturePoseQuery()) evaluatePose(entity)
}

export const MotionCaptureInputSystem = defineSystem({
  uuid: 'xrengine.engine.MotionCaptureInputSystem',
  insert: { before: InputSystemGroup },
  execute
})
