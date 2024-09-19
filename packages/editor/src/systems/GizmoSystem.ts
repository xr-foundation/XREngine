import { useEffect } from 'react'

import { getComponent, removeComponent, setComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { defineQuery } from '@xrengine/ecs/src/QueryFunctions'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { AnimationSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { SourceComponent } from '@xrengine/engine/src/scene/components/SourceComponent'

import { TransformGizmoControlComponent } from '../classes/TransformGizmoControlComponent'
import { TransformGizmoControlledComponent } from '../classes/TransformGizmoControlledComponent'
import { controlUpdate, gizmoUpdate, planeUpdate } from '../functions/gizmoHelper'
import { SelectionState } from '../services/SelectionServices'

const sourceQuery = defineQuery([SourceComponent, TransformGizmoControlledComponent])
export const transformGizmoControllerQuery = defineQuery([TransformGizmoControlComponent])
export const transformGizmoControlledQuery = defineQuery([TransformGizmoControlledComponent])

const execute = () => {
  for (const gizmoEntity of transformGizmoControllerQuery()) {
    const gizmoControlComponent = getComponent(gizmoEntity, TransformGizmoControlComponent)
    if (!gizmoControlComponent.enabled) return

    if (!gizmoControlComponent.visualEntity) return
    gizmoUpdate(gizmoEntity)
    if (!gizmoControlComponent.planeEntity) return
    planeUpdate(gizmoEntity)
    controlUpdate(gizmoEntity)
  }
}

const reactor = () => {
  const selectedEntities = SelectionState.useSelectedEntities()

  for (const entity of sourceQuery()) removeComponent(entity, TransformGizmoControlledComponent)

  useEffect(() => {
    if (!selectedEntities) return
    const lastSelection = selectedEntities[selectedEntities.length - 1]
    if (!lastSelection) return
    setComponent(lastSelection, TransformGizmoControlledComponent)
  }, [selectedEntities])

  return null
}

export const GizmoSystem = defineSystem({
  uuid: 'xrengine.editor.GizmoSystem',
  insert: { with: AnimationSystemGroup },
  execute,
  reactor
})
