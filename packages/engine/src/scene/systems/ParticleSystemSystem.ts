import { ECSState } from '@xrengine/ecs/src/ECSState'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { getState } from '@xrengine/hyperflux'

import { ParticleState } from '../components/ParticleSystemComponent'
import { SceneObjectSystem } from './SceneObjectSystem'

const execute = () => {
  const renderers = getState(ParticleState).renderers
  for (const rendererInstance of Object.values(renderers)) {
    const batchRenderer = rendererInstance.renderer
    const deltaSeconds = getState(ECSState).deltaSeconds
    batchRenderer.update(deltaSeconds)
  }
}

export const ParticleSystem = defineSystem({
  uuid: 'xrengine.engine.ParticleSystem',
  insert: { with: SceneObjectSystem },
  execute
})
