import { VRM } from '@pixiv/three-vrm'
import { AnimationClip, KeyframeTrack, Object3D, Quaternion, QuaternionKeyframeTrack, VectorKeyframeTrack } from 'three'

import { mixamoVRMRigMap, recursiveHipsLookup } from '../AvatarBoneMatching'

const restRotationInverse = new Quaternion()
const parentRestWorldRotation = new Quaternion()
const _quatA = new Quaternion()

/**Retargets an animation clip into normalized bone space for use with any T-Posed normalized humanoid rig */
export const retargetAnimationClip = (clip: AnimationClip, mixamoScene: Object3D) => {
  const hipsPositionScale = recursiveHipsLookup(mixamoScene).parent.scale.y

  for (let i = 0; i < clip.tracks.length; i++) {
    const track = clip.tracks[i]
    const trackSplitted = track.name.split('.')
    const rigNodeName = trackSplitted[0]
    const rigNode = mixamoScene.getObjectByName(rigNodeName)!

    mixamoScene.updateWorldMatrix(true, true)

    // Store rotations of rest-pose
    rigNode.getWorldQuaternion(restRotationInverse).invert()
    rigNode.parent!.getWorldQuaternion(parentRestWorldRotation)

    if (track instanceof QuaternionKeyframeTrack) {
      // Retarget rotation of mixamoRig to NormalizedBone
      for (let i = 0; i < track.values.length; i += 4) {
        const flatQuaternion = track.values.slice(i, i + 4)

        _quatA.fromArray(flatQuaternion)

        _quatA.premultiply(parentRestWorldRotation).multiply(restRotationInverse)

        _quatA.toArray(flatQuaternion)

        flatQuaternion.forEach((v, index) => {
          track.values[index + i] = v
        })
      }
    } else if (track instanceof VectorKeyframeTrack) {
      const value = track.values.map((v) => v * hipsPositionScale)
      value.forEach((v, index) => {
        track.values[index] = v
      })
    }
  }
}

/**Clones and binds a mixamo animation clip to a given VRM humanoid's normalized bones */
export const bindAnimationClipFromMixamo = (clip: AnimationClip, vrm: VRM) => {
  const tracks = [] as KeyframeTrack[]
  for (let i = 0; i < clip.tracks.length; i++) {
    const trackClone = clip.tracks[i].clone()
    const trackSplitted = trackClone.name.split('.')
    const mixamoPrefix = trackSplitted[0].includes('mixamorig') ? '' : 'mixamorig'
    const mixamoBoneName = mixamoPrefix + trackSplitted[0]
    const vrmBoneName = mixamoVRMRigMap[mixamoBoneName]
    const vrmNodeName = vrm.humanoid?.getNormalizedBoneNode(vrmBoneName)?.name

    if (vrmNodeName != null) {
      const propertyName = trackSplitted[1]
      trackClone.name = `${vrmNodeName}.${propertyName}`
      tracks.push(trackClone)
    }
  }
  return new AnimationClip(clip.name, clip.duration, tracks)
}
