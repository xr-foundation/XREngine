
import { Types } from 'bitecs'
import { useEffect } from 'react'
import { Quaternion, Vector3 } from 'three'

import { UUIDComponent } from '@xrengine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  removeComponent,
  setComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { Entity, EntityUUID } from '@xrengine/ecs/src/Entity'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { UserID, getMutableState, useHookstate } from '@xrengine/hyperflux'
import { NetworkObjectComponent } from '@xrengine/network'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { AxesHelperComponent } from '@xrengine/spatial/src/common/debug/AxesHelperComponent'
import { RendererState } from '@xrengine/spatial/src/renderer/RendererState'
import { ObjectLayerMasks } from '@xrengine/spatial/src/renderer/constants/ObjectLayers'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'

import { ikTargets } from '../animation/Util'
import { AvatarRigComponent } from './AvatarAnimationComponent'

export const AvatarHeadDecapComponent = defineComponent({
  name: 'AvatarHeadDecapComponent'
})

export type AvatarIKTargetsType = {
  head: boolean
  leftHand: boolean
  rightHand: boolean
}

export const AvatarIKTargetComponent = defineComponent({
  name: 'AvatarIKTargetComponent',
  schema: { blendWeight: Types.f64 },

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).avatarDebug)

    useEffect(() => {
      if (debugEnabled.value) {
        setComponent(entity, AxesHelperComponent, {
          name: 'avatar-ik-helper',
          size: 0.5,
          layerMask: ObjectLayerMasks.AvatarHelper
        })
      }

      return () => {
        removeComponent(entity, AxesHelperComponent)
      }
    }, [debugEnabled])

    return null
  },

  getTargetEntity: (ownerID: UserID, targetName: (typeof ikTargets)[keyof typeof ikTargets]) => {
    return UUIDComponent.getEntityByUUID((ownerID + targetName) as EntityUUID)
  }
})

/**
 * Gets the hand position in world space
 * @param entity the player entity
 * @param hand which hand to get
 * @returns {Vector3}
 */

const vec3 = new Vector3()
const quat = new Quaternion()

type HandTargetReturn = { position: Vector3; rotation: Quaternion } | null
export const getHandTarget = (entity: Entity, hand: XRHandedness): HandTargetReturn => {
  const networkComponent = getComponent(entity, NetworkObjectComponent)

  const targetEntity = NameComponent.entitiesByName[networkComponent.ownerId + '_' + hand]?.[0] // todo, how should be choose which one to use?
  if (targetEntity && AvatarIKTargetComponent.blendWeight[targetEntity] > 0)
    return getComponent(targetEntity, TransformComponent)

  const rig = getOptionalComponent(entity, AvatarRigComponent)
  if (!rig?.rawRig) return getComponent(entity, TransformComponent)

  switch (hand) {
    case 'left':
      return {
        position: rig.rawRig.leftHand.node.getWorldPosition(vec3),
        rotation: rig.rawRig.leftHand.node.getWorldQuaternion(quat)
      }
    case 'right':
      return {
        position: rig.rawRig.rightHand.node.getWorldPosition(vec3),
        rotation: rig.rawRig.rightHand.node.getWorldQuaternion(quat)
      }
    default:
    case 'none':
      return {
        position: rig.rawRig.head.node.getWorldPosition(vec3),
        rotation: rig.rawRig.head.node.getWorldQuaternion(quat)
      }
  }
}
