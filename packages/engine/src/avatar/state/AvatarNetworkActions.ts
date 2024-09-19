import matches from 'ts-matches'

import { matchesEntityUUID } from '@xrengine/ecs'
import { defineAction } from '@xrengine/hyperflux'
import { NetworkTopics } from '@xrengine/network'
import { SpawnObjectActions } from '@xrengine/spatial/src/transform/SpawnObjectActions'

import { matchesIkTarget } from '../animation/Util'

export class AvatarNetworkAction {
  static spawn = defineAction(
    SpawnObjectActions.spawnObject.extend({
      type: 'xrengine.engine.avatar.SPAWN',
      avatarURL: matches.string,
      name: matches.string
    })
  )

  static setAnimationState = defineAction({
    type: 'xrengine.engine.avatar.SET_ANIMATION_STATE',
    entityUUID: matchesEntityUUID,
    clipName: matches.string.optional(),
    animationAsset: matches.string,
    loop: matches.boolean.optional(),
    needsSkip: matches.boolean.optional(),
    layer: matches.number.optional(),
    $topic: NetworkTopics.world
  })

  static setAvatarURL = defineAction({
    type: 'xrengine.engine.avatar.SET_AVATAR_URL',
    entityUUID: matchesEntityUUID,
    avatarURL: matches.string,
    $cache: {
      removePrevious: true
    },
    $topic: NetworkTopics.world
  })

  static setName = defineAction({
    type: 'xrengine.engine.avatar.SET_AVATAR_NAME',
    entityUUID: matchesEntityUUID,
    name: matches.string,
    $cache: {
      removePrevious: true
    },
    $topic: NetworkTopics.world
  })

  static spawnIKTarget = defineAction(
    SpawnObjectActions.spawnObject.extend({
      type: 'xrengine.engine.avatar.SPAWN_IK_TARGET',
      name: matchesIkTarget,
      blendWeight: matches.number
    })
  )
}
