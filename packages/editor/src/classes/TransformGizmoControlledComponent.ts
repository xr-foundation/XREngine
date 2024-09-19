import { useEffect } from 'react'
import { Box3, Vector3 } from 'three'

import { Engine, Entity, UndefinedEntity } from '@xrengine/ecs'
import {
  defineComponent,
  getComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { TransformPivot } from '@xrengine/engine/src/scene/constants/transformConstants'
import { useHookstate, useMutableState } from '@xrengine/hyperflux'
import { TransformComponent } from '@xrengine/spatial'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'
import { TransformGizmoTagComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { EditorHelperState } from '../services/EditorHelperState'
import { SelectionState } from '../services/SelectionServices'
import { TransformGizmoControlComponent } from './TransformGizmoControlComponent'
import { TransformGizmoVisualComponent } from './TransformGizmoVisualComponent'

export const TransformGizmoControlledComponent = defineComponent({
  name: 'TransformGizmoControlled',

  schema: S.Object({ controller: S.Entity() }),

  reactor: function (props) {
    const entity = useEntityContext()
    const transformGizmoControlledComponent = useComponent(entity, TransformGizmoControlledComponent)
    const selectedEntities = SelectionState.useSelectedEntities()
    const editorHelperState = useMutableState(EditorHelperState)
    const box = useHookstate(() => new Box3())

    const createPivotEntity = () => {
      const pivotEntity = createEntity()
      setComponent(pivotEntity, NameComponent, 'gizmoPivotEntity')
      setComponent(pivotEntity, TransformComponent)
      setComponent(pivotEntity, VisibleComponent)
      setComponent(pivotEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
      setComponent(pivotEntity, TransformGizmoTagComponent)

      /*addObjectToGroup(
        pivotEntity,
        new Mesh(new SphereGeometry(1.5, 32, 32), new MeshBasicMaterial({ color: 0xff0000 }))
      )*/
      // useful for debug so leaving it here
      return pivotEntity
    }

    useEffect(() => {
      const gizmoControlEntity = createEntity()
      const gizmoVisualEntity = createEntity()
      const gizmoPlaneEntity = createEntity()
      setComponent(gizmoControlEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
      setComponent(gizmoVisualEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
      setComponent(gizmoPlaneEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })

      const controlledEntities = [entity]
      setComponent(gizmoControlEntity, NameComponent, 'gizmoControllerEntity')
      setComponent(gizmoControlEntity, TransformGizmoControlComponent, {
        controlledEntities: controlledEntities,
        visualEntity: gizmoVisualEntity,
        planeEntity: gizmoPlaneEntity
      })
      setComponent(gizmoControlEntity, TransformGizmoTagComponent)
      setComponent(gizmoControlEntity, VisibleComponent)

      transformGizmoControlledComponent.controller.set(gizmoControlEntity)

      setComponent(gizmoVisualEntity, NameComponent, 'gizmoVisualEntity')
      setComponent(gizmoVisualEntity, TransformGizmoVisualComponent)
      setComponent(gizmoVisualEntity, TransformGizmoTagComponent)
      setComponent(gizmoVisualEntity, VisibleComponent)

      setComponent(gizmoPlaneEntity, NameComponent, 'gizmoPlaneEntity')
      setComponent(gizmoPlaneEntity, TransformGizmoTagComponent)
      //NOTE: VisibleComponent for gizmoPlaneEntity is managed in TransformGizmoControlComponent based on drag interaction

      return () => {
        removeEntity(gizmoControlEntity)
        removeComponent(gizmoVisualEntity, TransformGizmoVisualComponent)
        removeEntity(gizmoVisualEntity)
        removeEntity(gizmoPlaneEntity)
      }
    }, [])

    useEffect(() => {
      if (selectedEntities.length <= 1) return
      const controlledEntities = selectedEntities
      const existingPivot = getComponent(
        transformGizmoControlledComponent.controller.value,
        TransformGizmoControlComponent
      ).pivotEntity
      const pivot = existingPivot === UndefinedEntity ? createPivotEntity() : existingPivot
      setComponent(transformGizmoControlledComponent.controller.value, TransformGizmoControlComponent, {
        controlledEntities: controlledEntities,
        pivotEntity: pivot
      })
      return () => {
        setComponent(transformGizmoControlledComponent.controller.value, TransformGizmoControlComponent, {
          pivotEntity: UndefinedEntity
        })
        removeEntity(pivot)
      }
    }, [selectedEntities])

    useEffect(() => {
      if (selectedEntities.length <= 1) return
      const controlledEntities = selectedEntities
      const pivot = getComponent(
        transformGizmoControlledComponent.controller.value,
        TransformGizmoControlComponent
      ).pivotEntity
      if (pivot === UndefinedEntity) return

      const newPosition = new Vector3()
      TransformComponent.getWorldPosition(pivot, newPosition)

      switch (editorHelperState.transformPivot.value) {
        case TransformPivot.Origin:
          newPosition.setScalar(0)
          break
        case TransformPivot.FirstSelected:
          TransformComponent.getWorldPosition(controlledEntities[0], newPosition)
          break
        case TransformPivot.Center:
          getMidpointWorldPosition(controlledEntities, newPosition)
          break
        case TransformPivot.BoundingBox:
        case TransformPivot.BoundingBoxBottom:
          box.value.makeEmpty()

          for (let i = 0; i < controlledEntities.length; i++) {
            const parentEnt = controlledEntities[i]
            box.value.expandByPoint(getComponent(parentEnt, TransformComponent).position)
          }
          box.value.getCenter(newPosition)

          if (editorHelperState.transformPivot.value === TransformPivot.BoundingBoxBottom)
            newPosition.y = box.min.y.value
          break
      }

      setComponent(pivot, TransformComponent, { position: newPosition })
    }, [editorHelperState.transformPivot, selectedEntities])

    return null
  }
})

const getMidpointWorldPosition = (entities: Entity[], outVec3: Vector3) => {
  outVec3.set(0, 0, 0)
  const position = new Vector3()
  for (const entity of entities) {
    TransformComponent.getWorldPosition(entity, position)
    outVec3.add(position)
  }
  outVec3.divideScalar(entities.length)
}
