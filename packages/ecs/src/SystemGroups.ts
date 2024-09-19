
import { defineSystem } from './SystemFunctions'

export const InputSystemGroup = defineSystem({
  uuid: 'xrengine.engine.input-group',
  insert: {}
})

/** Run inside of fixed pipeline */
export const SimulationSystemGroup = defineSystem({
  uuid: 'xrengine.engine.simulation-group',
  insert: {}
})

export const AnimationSystemGroup = defineSystem({
  uuid: 'xrengine.engine.animation-group',
  insert: {}
})

export const PresentationSystemGroup = defineSystem({
  uuid: 'xrengine.engine.presentation-group',
  insert: {}
})

export const DefaultSystemPipeline = [
  InputSystemGroup,
  SimulationSystemGroup,
  AnimationSystemGroup,
  PresentationSystemGroup
]
