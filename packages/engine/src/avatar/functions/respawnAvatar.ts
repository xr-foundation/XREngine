
import { UUIDComponent } from '@xrengine/ecs'
import { getComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { getState } from '@xrengine/hyperflux'
import { SpawnPoseState } from '@xrengine/spatial'

import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { teleportAvatar } from './moveAvatar'

export const respawnAvatar = (entity?: Entity) => {
  if (!entity) return
  const { spawnPosition } = getState(SpawnPoseState)[getComponent(entity, UUIDComponent)]
  const controller = getComponent(entity, AvatarControllerComponent)
  controller.verticalVelocity = 0
  teleportAvatar(entity, spawnPosition)
}
