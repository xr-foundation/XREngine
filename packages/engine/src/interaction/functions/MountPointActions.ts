
import matches from 'ts-matches'

import { EntityUUID, matchesEntityUUID } from '@xrengine/ecs'
import { defineAction, defineState, getMutableState, none } from '@xrengine/hyperflux'
import { NetworkTopics } from '@xrengine/network'

export class MountPointActions {
  static mountInteraction = defineAction({
    type: 'xrengine.engine.interactions.MOUNT' as const,
    mounted: matches.boolean,
    targetMount: matchesEntityUUID,
    mountedEntity: matchesEntityUUID,
    $topic: NetworkTopics.world
  })
}

export const MountPointState = defineState({
  name: 'MountPointState',
  initial: {} as Record<EntityUUID, EntityUUID>,
  receptors: {
    onMountInteraction: MountPointActions.mountInteraction.receive((action) => {
      const state = getMutableState(MountPointState)
      if (action.mounted) state[action.targetMount].merge(action.mountedEntity)
      else state[action.targetMount].set(none)
    })
  }
})
