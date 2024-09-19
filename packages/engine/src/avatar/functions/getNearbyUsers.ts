
import { getComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { defineQuery } from '@xrengine/ecs/src/QueryFunctions'
import { UserID } from '@xrengine/hyperflux'
import { NetworkObjectComponent } from '@xrengine/network'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'

import { AvatarComponent } from '../../avatar/components/AvatarComponent'

type NearbyUser = { id: UserID; distance: number }

const compareDistance = (a: NearbyUser, b: NearbyUser) => a.distance - b.distance

const remoteAvatars = defineQuery([NetworkObjectComponent, AvatarComponent, TransformComponent])

export function getNearbyUsers(userId: UserID, nonChannelUserIds: UserID[]): Array<UserID> {
  const userAvatarEntity = AvatarComponent.getUserAvatarEntity(userId)
  if (!userAvatarEntity) return []
  const userPosition = getComponent(userAvatarEntity, TransformComponent).position
  if (!userPosition) return []
  const userDistances = [] as Array<{ id: UserID; distance: number }>
  for (const avatarEntity of remoteAvatars()) {
    if (userAvatarEntity === avatarEntity) continue
    const position = getComponent(avatarEntity, TransformComponent).position
    const ownerId = getComponent(avatarEntity, NetworkObjectComponent).ownerId
    userDistances.push({
      id: ownerId,
      distance: position.distanceTo(userPosition)
    })
  }
  return userDistances
    .filter((u) => nonChannelUserIds.indexOf(u.id) > -1)
    .sort(compareDistance)
    .map((u) => u.id)
}
