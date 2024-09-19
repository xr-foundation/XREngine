
import { Quaternion, Vector3 } from 'three'

const EPSILON = 0.001
const EPSILON_SQ = EPSILON * EPSILON
const tempVec3 = new Vector3()

function vec3NearEqual(a: Vector3, b: Vector3, epsilon: number = EPSILON_SQ): boolean {
  return tempVec3.subVectors(a, b).lengthSq() < epsilon
}

function formatQuat(q: Quaternion) {
  return `${q.x} ${q.y} ${q.z} ${q.w}`
}

function formatVec3(v: Vector3) {
  return `${v.x} ${v.y} ${v.z}`
}

// quaternions sometimes hit numbers slightly above 1e-15
const QUAT_EPSILON = 1e-14

describe('retargetSkeleton', () => {
  // it('Check retargetSkeleton Rotations', () => {
  //   const defaultSkeleton = (makeDefaultSkinnedMesh().children[0] as SkinnedMesh).skeleton
  //   const targetMesh = makeSkinnedMeshFromBoneData(targetSkeletonData).children[0] as SkinnedMesh
  //   const targetSkeleton = targetMesh.skeleton
  //   const parent = new Group()
  //   parent.add(targetMesh)
  //   parent.add(targetSkeleton.bones[0])
  //   // renames the bones to be compatible with the default skeleton
  //   const rig = avatarBoneMatching(parent)
  //   retargetSkeleton(targetSkeleton, defaultSkeleton)
  //   // Check for same bone orientations of source and target skeleton
  //   defaultSkeleton.bones[0].traverse((bone: Bone) => {
  //     const targetBone = rig[bone.name]
  //     if (!targetBone) {
  //       return
  //     }
  //     const message =
  //       bone.name +
  //       ' Quaternion / Source: ' +
  //       formatQuat(bone.quaternion) +
  //       ' / Target: ' +
  //       formatQuat(targetBone.quaternion)
  //     assert(quatNearEqual(bone.quaternion, targetBone.quaternion, QUAT_EPSILON), message)
  //   })
  // })
  // it('Check retargetSkeleton Positions', () => {
  //   const defaultSkeleton = (makeDefaultSkinnedMesh().children[0] as SkinnedMesh).skeleton
  //   const targetMesh = makeSkinnedMeshFromBoneData(targetSkeletonData).children[0] as SkinnedMesh
  //   const targetSkeleton = targetMesh.skeleton
  //   const parent = new Group()
  //   parent.add(targetMesh)
  //   parent.add(targetSkeleton.bones[0])
  //   // renames the bones to be compatible with the default skeleton
  //   const rig = avatarBoneMatching(parent)
  //   retargetSkeleton(targetSkeleton, defaultSkeleton)
  //   const targetSkeletonUnmodified = (makeSkinnedMeshFromBoneData(targetSkeletonData).children[0] as SkinnedMesh)
  //     .skeleton
  //   // Check for same bone world positions with original target skeleton
  //   rig?.humanoid?.getRawBoneNode('hips')?.traverse((bone: Bone) => {
  //     // Find the bone index
  //     const i = targetSkeleton.bones.findIndex((b) => b.name === bone.name)
  //     assert(i > -1, `Could not find bone ${bone.name}`)
  //     const origWorldMat = new Matrix4().copy(targetSkeletonUnmodified.boneInverses[i]).invert()
  //     const modWorldMat = new Matrix4().copy(targetSkeleton.boneInverses[i]).invert()
  //     const origPos = new Vector3()
  //     const modPos = new Vector3()
  //     origWorldMat.decompose(origPos, new Quaternion(), new Vector3())
  //     modWorldMat.decompose(modPos, new Quaternion(), new Vector3())
  //     const message = bone.name + ' Position / Original: ' + formatVec3(origPos) + ' / Modified: ' + formatVec3(modPos)
  //     assert(vec3NearEqual(origPos, modPos), message)
  //   })
  // })
})
