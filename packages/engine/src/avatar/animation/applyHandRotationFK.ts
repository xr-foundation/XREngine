import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm'

import { XRJointAvatarBoneMap } from '@xrengine/spatial/src/xr/XRComponents'

export const applyHandRotationFK = (vrm: VRM, handedness: 'left' | 'right', rotations: Float32Array) => {
  const bones = Object.values(XRJointAvatarBoneMap)
  for (let i = 0; i < bones.length; i++) {
    const label = bones[i]
    const boneName = `${handedness}${label}` as VRMHumanBoneName
    const bone = vrm.humanoid.getNormalizedBone(boneName)
    if (!bone?.node) continue
    bone.node.quaternion.fromArray(rotations, i * 4)
  }
}
