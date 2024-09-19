import { defineQuery } from '@xrengine/ecs/src/QueryFunctions'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { SimulationSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { NetworkObjectAuthorityTag } from '@xrengine/network'

import { applyGamepadInput } from '.././functions/moveAvatar'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'

const controlledAvatarEntity = defineQuery([AvatarControllerComponent, NetworkObjectAuthorityTag])

const execute = () => {
  for (const entity of controlledAvatarEntity()) applyGamepadInput(entity)
}

export const AvatarMovementSystem = defineSystem({
  uuid: 'xrengine.engine.AvatarMovementSystem',
  insert: { with: SimulationSystemGroup },
  execute
})
