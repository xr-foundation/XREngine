// spawnPose is temporary - just so portals work for now - will be removed in favor of instanceserver-instanceserver communication
import { Quaternion, Vector3 } from 'three'

import { InviteCode } from '@xrengine/common/src/schema.type.module'
import { EntityUUID } from '@xrengine/ecs'
import { Engine } from '@xrengine/ecs/src/Engine'
import { Action, PeerID, dispatchAction } from '@xrengine/hyperflux'
import { CameraActions } from '@xrengine/spatial/src/camera/CameraState'

import { ikTargets } from '@xrengine/engine/src/avatar/animation/Util'
import { AvatarNetworkAction } from '@xrengine/engine/src/avatar/state/AvatarNetworkActions'

export enum AuthError {
  MISSING_ACCESS_TOKEN = 'MISSING_ACCESS_TOKEN',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_NOT_AUTHORIZED = 'USER_NOT_AUTHORIZED',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export type AuthTask = {
  status: 'success' | 'fail' | 'pending'
  hostPeerID?: PeerID
  routerRtpCapabilities?: any
  cachedActions?: Required<Action>[]
  error?: AuthError
}

export type ReadyTask = {
  instanceReady: boolean
}

export type JoinWorldRequestData = {
  inviteCode?: InviteCode
}

export type JoinWorldProps = {
  peerIndex: number
  cachedActions: Required<Action>[]
}

export type SpawnInWorldProps = {
  parentUUID: EntityUUID
  avatarSpawnPose: { position: Vector3; rotation: Quaternion }
  avatarURL: string
  name: string
}

export const spawnLocalAvatarInWorld = (props: SpawnInWorldProps) => {
  const { avatarSpawnPose, avatarURL, parentUUID } = props
  console.log('SPAWN IN WORLD', avatarSpawnPose, avatarURL)
  const entityUUID = Engine.instance.userID
  dispatchAction(
    AvatarNetworkAction.spawn({
      ...avatarSpawnPose,
      parentUUID,
      avatarURL,
      entityUUID: (entityUUID + '_avatar') as EntityUUID,
      name: props.name
    })
  )
  dispatchAction(CameraActions.spawnCamera({ parentUUID, entityUUID: (entityUUID + '_camera') as EntityUUID }))

  const headUUID = (entityUUID + ikTargets.head) as EntityUUID
  const leftHandUUID = (entityUUID + ikTargets.leftHand) as EntityUUID
  const rightHandUUID = (entityUUID + ikTargets.rightHand) as EntityUUID
  const leftFootUUID = (entityUUID + ikTargets.leftFoot) as EntityUUID
  const rightFootUUID = (entityUUID + ikTargets.rightFoot) as EntityUUID

  dispatchAction(AvatarNetworkAction.spawnIKTarget({ parentUUID, entityUUID: headUUID, name: 'head', blendWeight: 0 }))
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({ parentUUID, entityUUID: leftHandUUID, name: 'leftHand', blendWeight: 0 })
  )
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({ parentUUID, entityUUID: rightHandUUID, name: 'rightHand', blendWeight: 0 })
  )
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({ parentUUID, entityUUID: leftFootUUID, name: 'leftFoot', blendWeight: 0 })
  )
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({ parentUUID, entityUUID: rightFootUUID, name: 'rightFoot', blendWeight: 0 })
  )
}
