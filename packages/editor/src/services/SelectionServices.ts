import { useEffect } from 'react'

import { EntityUUID, UUIDComponent } from '@xrengine/ecs'
import { removeComponent, setComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { entityExists } from '@xrengine/ecs/src/EntityFunctions'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { SelectTagComponent } from '@xrengine/engine/src/scene/components/SelectTagComponent'
import { MaterialSelectionState } from '@xrengine/engine/src/scene/materials/MaterialLibraryState'
import { defineState, getMutableState, getState, useHookstate } from '@xrengine/hyperflux'

export const SelectionState = defineState({
  name: 'SelectionState',
  initial: {
    selectedEntities: [] as EntityUUID[]
  },
  updateSelection: (selectedEntities: EntityUUID[]) => {
    getMutableState(MaterialSelectionState).selectedMaterial.set(null)
    getMutableState(SelectionState).merge({
      selectedEntities: selectedEntities
    })
  },
  getSelectedEntities: () => {
    return getState(SelectionState).selectedEntities.map(UUIDComponent.getEntityByUUID)
  },

  useSelectedEntities: () => {
    return useHookstate(getMutableState(SelectionState).selectedEntities).value.map(UUIDComponent.getEntityByUUID)
  }
})

const reactor = () => {
  const selectedEntities = useHookstate(getMutableState(SelectionState).selectedEntities)

  useEffect(() => {
    const entities = [...selectedEntities.value].map(UUIDComponent.getEntityByUUID)
    for (const entity of entities) {
      if (!entityExists(entity)) continue
      setComponent(entity, SelectTagComponent)
    }

    return () => {
      for (const entity of entities) {
        if (!entityExists(entity)) continue
        removeComponent(entity, SelectTagComponent)
      }
    }
  }, [selectedEntities.length])

  return null
}

export const EditorSelectionReceptorSystem = defineSystem({
  uuid: 'xrengine.engine.EditorSelectionReceptorSystem',
  insert: { before: PresentationSystemGroup },
  reactor
})
