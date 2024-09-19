
import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { VRMHumanBoneList, VRMHumanBoneName } from '@pixiv/three-vrm'
import { useEffect } from 'react'

import { defineComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { ECSSchema } from '@xrengine/ecs/src/schemas/ECSSchemas'

export const MotionCaptureRigComponent = defineComponent({
  name: 'MotionCaptureRigComponent',

  schema: {
    rig: Object.fromEntries(VRMHumanBoneList.map((b) => [b, ECSSchema.Quaternion])) as Record<
      VRMHumanBoneName,
      typeof ECSSchema.Quaternion
    >,
    slerpedRig: Object.fromEntries(VRMHumanBoneList.map((b) => [b, ECSSchema.Quaternion])) as Record<
      VRMHumanBoneName,
      typeof ECSSchema.Quaternion
    >,
    hipPosition: ECSSchema.Vec3,
    hipRotation: ECSSchema.Quaternion,
    footOffset: 'f64',
    solvingLowerBody: 'ui8'
  },

  onInit: (initial) => {
    return {
      /** @todo if these have a fixed max length we can move them into the ecs schema */
      prevWorldLandmarks: null as NormalizedLandmark[] | null,
      prevScreenLandmarks: null as NormalizedLandmark[] | null
    }
  },

  reactor: function () {
    const entity = useEntityContext()

    useEffect(() => {
      for (const boneName of VRMHumanBoneList) {
        //causes issues with ik solves, commenting out for now
        //proxifyVector3(AvatarRigComponent.rig[boneName].position, entity)
        //proxifyQuaternion(AvatarRigComponent.rig[boneName].rotation, entity)
      }
      MotionCaptureRigComponent.solvingLowerBody[entity] = 1
    }, [])

    return null
  }
})
