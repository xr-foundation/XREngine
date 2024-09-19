
import { removeComponent, setComponent } from '@xrengine/ecs'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { AnimationSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { HighlightComponent } from '@xrengine/spatial/src/renderer/components/HighlightComponent'
import { useEffect } from 'react'
import { SelectionState } from '../services/SelectionServices'

const reactor = () => {
  const selectedEntities = SelectionState.useSelectedEntities()

  useEffect(() => {
    if (!selectedEntities) return
    const prevSelectedEntities = selectedEntities
    if (!prevSelectedEntities) return
    for (const entity of prevSelectedEntities) {
      setComponent(entity, HighlightComponent)
    }
    return () => {
      for (const entity of prevSelectedEntities) {
        removeComponent(entity, HighlightComponent)
      }
    }
  }, [selectedEntities])

  return null
}

export const HighlightSystem = defineSystem({
  uuid: 'xrengine.editor.HighlightSystem',
  insert: { with: AnimationSystemGroup },
  reactor
})
