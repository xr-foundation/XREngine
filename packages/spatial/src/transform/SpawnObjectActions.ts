import { defineAction } from '@xrengine/hyperflux'
import { WorldNetworkAction } from '@xrengine/network'

import { matchesQuaternion, matchesVector3 } from '../common/functions/MatchesUtils'

export const SpawnObjectActions = {
  spawnObject: defineAction(
    WorldNetworkAction.spawnEntity.extend({
      type: 'xrengine.engine.world.SPAWN_OBJECT',
      position: matchesVector3.optional(),
      rotation: matchesQuaternion.optional()
    })
  )
}
