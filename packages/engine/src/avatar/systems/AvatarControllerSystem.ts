/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import {
  Engine,
  UUIDComponent,
  defineQuery,
  defineSystem,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@etherealengine/ecs'
import { dispatchAction, getState } from '@etherealengine/hyperflux'
import { NetworkObjectAuthorityTag, NetworkState, WorldNetworkAction } from '@etherealengine/network'
import { TransformComponent, TransformSystem } from '@etherealengine/spatial'
import { FollowCameraComponent } from '@etherealengine/spatial/src/camera/components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '@etherealengine/spatial/src/camera/components/TargetCameraRotationComponent'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { DistanceFromLocalClientComponent } from '@etherealengine/spatial/src/transform/components/DistanceComponents'
import { getDistanceSquaredFromTarget } from '@etherealengine/spatial/src/transform/systems/TransformSystem'
import { XRControlsState } from '@etherealengine/spatial/src/xr/XRState'
import { Vector3 } from 'three'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarHeadDecapComponent } from '../components/AvatarIKComponents'
import { respawnAvatar } from '../functions/respawnAvatar'
import { AvatarInputSystem } from './AvatarInputSystem'

const controllerQuery = defineQuery([AvatarControllerComponent, NetworkObjectAuthorityTag])

const execute = () => {
  const controlledEntities = controllerQuery()

  for (const avatarEntity of controllerQuery.enter()) {
    const controller = getComponent(avatarEntity, AvatarControllerComponent)

    const targetCameraRotation = getComponent(controller.cameraEntity, TargetCameraRotationComponent)
    setComponent(controller.cameraEntity, FollowCameraComponent, {
      targetEntity: avatarEntity,
      phi: targetCameraRotation.phi,
      theta: targetCameraRotation.theta
    })
  }

  /** @todo non-immersive camera should utilize isCameraAttachedToAvatar */
  if (!getState(XRControlsState).isCameraAttachedToAvatar)
    for (const entity of controlledEntities) {
      const controller = getComponent(entity, AvatarControllerComponent)
      const followCamera = getOptionalComponent(controller.cameraEntity, FollowCameraComponent)
      if (followCamera) {
        // todo calculate head size and use that as the bound #7263
        if (followCamera.distance < 0.3) setComponent(entity, AvatarHeadDecapComponent, true)
        else removeComponent(entity, AvatarHeadDecapComponent)
      }
    }

  for (const entity of controlledEntities) {
    const controller = getComponent(entity, AvatarControllerComponent)

    if (!controller.movementCaptured.length) {
      if (
        !hasComponent(entity, NetworkObjectAuthorityTag) &&
        NetworkState.worldNetwork &&
        controller.gamepadLocalInput.lengthSq() > 0
      ) {
        dispatchAction(
          WorldNetworkAction.transferAuthorityOfObject({
            ownerID: Engine.instance.userID,
            entityUUID: getComponent(entity, UUIDComponent),
            newAuthority: Engine.instance.peerID
          })
        )
        setComponent(entity, NetworkObjectAuthorityTag)
      }
    }

    const rigidbody = getComponent(entity, RigidBodyComponent)
    if (rigidbody.position.y < -10) respawnAvatar(entity)
  }
}

export const AvatarControllerSystem = defineSystem({
  uuid: 'ee.engine.AvatarControllerSystem',
  insert: { after: AvatarInputSystem },
  execute
})

const distanceFromLocalClientQuery = defineQuery([TransformComponent, DistanceFromLocalClientComponent])

export const AvatarPostTransformSystem = defineSystem({
  uuid: 'ee.engine.AvatarPostTransformSystem',
  insert: { after: TransformSystem },
  execute: () => {
    const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
    if (!selfAvatarEntity) return
    const localClientPosition = TransformComponent.getWorldPosition(selfAvatarEntity, vec3)
    if (localClientPosition) {
      for (const entity of distanceFromLocalClientQuery())
        DistanceFromLocalClientComponent.squaredDistance[entity] = getDistanceSquaredFromTarget(
          entity,
          localClientPosition
        )
    }
  }
})

const vec3 = new Vector3()
