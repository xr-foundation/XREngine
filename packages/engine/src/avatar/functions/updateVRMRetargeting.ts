
import { VRM, VRMHumanBoneList } from '@pixiv/three-vrm'
import { Matrix4, Object3D, Quaternion, Vector3 } from 'three'

import { getComponent, getOptionalComponent, hasComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'

import { AvatarComponent } from '../components/AvatarComponent'
import { BoneComponent } from '../components/BoneComponent'

export const updateVRMRetargeting = (vrm: VRM, avatarEntity: Entity) => {
  const humanoidRig = (vrm.humanoid as any)._normalizedHumanBones // as VRMHumanoidRig
  for (const boneName of VRMHumanBoneList) {
    const boneNode = humanoidRig.original.getBoneNode(boneName) as Object3D | null

    if (boneNode != null) {
      const rigBoneNode = humanoidRig.getBoneNode(boneName)! as Object3D

      delete TransformComponent.dirtyTransforms[rigBoneNode.entity]

      const parentWorldRotation = humanoidRig._parentWorldRotations[boneName]!
      const invParentWorldRotation = _quatA.copy(parentWorldRotation).invert()
      const boneRotation = humanoidRig._boneRotations[boneName]!

      boneNode.quaternion
        .copy(rigBoneNode.quaternion)
        .multiply(parentWorldRotation)
        .premultiply(invParentWorldRotation)
        .multiply(boneRotation)

      if (boneName === 'hips') {
        const entity = boneNode.entity
        const parentEntity = getOptionalComponent(entity, EntityTreeComponent)?.parentEntity
        if (!parentEntity) continue
        const parentBone =
          getOptionalComponent(parentEntity, BoneComponent) ?? getOptionalComponent(parentEntity, TransformComponent)
        if (!parentBone) continue
        _boneWorldPos.copy(rigBoneNode.position).applyMatrix4(parentBone?.matrixWorld)
        _parentWorldMatrixInverse.copy(parentBone.matrixWorld).invert()

        _boneWorldPos.applyMatrix4(_parentWorldMatrixInverse)
        if (hasComponent(avatarEntity, AvatarComponent)) {
          _boneWorldPos.multiplyScalar(getComponent(avatarEntity, AvatarComponent).hipsHeight)
        }
        boneNode.position.copy(_boneWorldPos)
      }
    }
  }
}

const _quatA = new Quaternion()
const _boneWorldPos = new Vector3()
const _parentWorldMatrixInverse = new Matrix4()
