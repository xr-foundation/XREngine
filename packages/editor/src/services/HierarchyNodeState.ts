
import { Entity } from '@xrengine/ecs'
import { defineState, syncStateWithLocalStorage } from '@xrengine/hyperflux'

interface IExpandedNodes {
  [scene: string]: {
    [entity: Entity]: true
  }
}

export const HierarchyTreeState = defineState({
  name: 'HierarchyTreeState',
  initial: {
    expandedNodes: {} as IExpandedNodes,
    search: { local: '', query: '' },
    firstSelectedEntity: null as Entity | null
  },
  extension: syncStateWithLocalStorage(['expandedNodes'])
})
