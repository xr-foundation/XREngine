import { defineQuery } from '@xrengine/ecs'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { NetworkObjectAuthorityTag } from '@xrengine/network'

import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { applyAutopilotInput } from '../functions/moveAvatar'
import { AvatarMovementSystem } from './AvatarMovementSystem'

const controllableAvatarQuery = defineQuery([AvatarControllerComponent, NetworkObjectAuthorityTag])

const execute = () => {
  for (const entity of controllableAvatarQuery()) {
    applyAutopilotInput(entity)
  }
}

export const AvatarAutopilotSystem = defineSystem({
  uuid: 'xrengine.engine.AvatarAutopilotSystem',
  insert: { after: AvatarMovementSystem },
  execute
})
