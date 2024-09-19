import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { SimulationSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { applyIncomingActions } from '@xrengine/hyperflux'

const execute = () => {
  applyIncomingActions()
}

export const IncomingActionSystem = defineSystem({
  uuid: 'xrengine.engine.IncomingActionSystem',
  insert: { before: SimulationSystemGroup },
  execute
})
