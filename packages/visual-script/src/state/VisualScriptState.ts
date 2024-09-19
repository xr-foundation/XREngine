import { defineState, getMutableState } from '@xrengine/hyperflux'

import { createBaseRegistry } from '../functions/createRegistry'
import { GraphTemplate } from '../types/GraphTemplate'
import { IRegistry } from '../VisualScriptModule'

export enum VisualScriptDomain {
  'ECS' = 'ECS'
}

export const VisualScriptState = defineState({
  name: 'VisualScriptState',
  initial: () => {
    const registry = createBaseRegistry()
    return {
      templates: [] as GraphTemplate[],
      registries: {
        [VisualScriptDomain.ECS]: registry
      } as Record<VisualScriptDomain, IRegistry>
    }
  },

  registerProfile: (register: (registry: IRegistry) => IRegistry, domain: string) => {
    getMutableState(VisualScriptState).registries[domain].set((current) => register(current))
  }
})
