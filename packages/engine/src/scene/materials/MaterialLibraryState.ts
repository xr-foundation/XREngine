import { EntityUUID } from '@xrengine/ecs'
import { defineState } from '@xrengine/hyperflux'

export const MaterialSelectionState = defineState({
  name: 'MaterialSelectionState',
  initial: {
    selectedMaterial: null as EntityUUID | null
  }
})
