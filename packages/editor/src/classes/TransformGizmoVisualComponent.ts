import { useEffect } from 'react'

import {
  createEntity,
  defineComponent,
  Engine,
  removeEntity,
  setComponent,
  useComponent,
  useEntityContext
} from '@xrengine/ecs'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { TransformMode } from '@xrengine/engine/src/scene/constants/transformConstants'
import { useHookstate } from '@xrengine/hyperflux'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { InputComponent } from '@xrengine/spatial/src/input/components/InputComponent'
import { addObjectToGroup, removeObjectFromGroup } from '@xrengine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'
import { TransformGizmoTagComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'
import { Mesh, Object3D } from 'three'
import {
  gizmoRotate,
  gizmoScale,
  gizmoTranslate,
  helperRotate,
  helperScale,
  helperTranslate,
  pickerRotate,
  pickerScale,
  pickerTranslate,
  setupGizmo
} from '../constants/GizmoPresets'

const useTranslateRotateScaleEntities = () => {
  const translate = useHookstate(createEntity)
  const rotate = useHookstate(createEntity)
  const scale = useHookstate(createEntity)

  useEffect(() => {
    return () => {
      removeEntity(translate.value)
      removeEntity(rotate.value)
      removeEntity(scale.value)
    }
  }, [])

  return {
    translate: translate.value,
    rotate: rotate.value,
    scale: scale.value
  }
}

const cleanupGizmo = (gizmoObj: Object3D) => {
  for (const child of gizmoObj.children as Mesh[]) {
    // Only dispose cloned geometry from setupGizmo
    if (child.geometry) child.geometry.dispose()
  }
}

export const TransformGizmoVisualComponent = defineComponent({
  name: 'TransformGizmoVisual',

  schema: S.Object({
    gizmo: S.Object({
      translate: S.Entity(),
      rotate: S.Entity(),
      scale: S.Entity()
    }),
    picker: S.Object({
      translate: S.Entity(),
      rotate: S.Entity(),
      scale: S.Entity()
    }),
    helper: S.Object({
      translate: S.Entity(),
      rotate: S.Entity(),
      scale: S.Entity()
    })
  }),

  reactor: function (props) {
    const gizmoVisualEntity = useEntityContext()
    const visualComponent = useComponent(gizmoVisualEntity, TransformGizmoVisualComponent)
    const gizmo = useTranslateRotateScaleEntities()
    const picker = useTranslateRotateScaleEntities()
    const helper = useTranslateRotateScaleEntities()

    useEffect(() => {
      // Gizmo creation
      const gizmoObject = {}
      const pickerObject = {}
      const helperObject = {}

      gizmoObject[TransformMode.translate] = setupGizmo(gizmoTranslate)
      gizmoObject[TransformMode.rotate] = setupGizmo(gizmoRotate)
      gizmoObject[TransformMode.scale] = setupGizmo(gizmoScale)

      pickerObject[TransformMode.translate] = setupGizmo(pickerTranslate)
      pickerObject[TransformMode.rotate] = setupGizmo(pickerRotate)
      pickerObject[TransformMode.scale] = setupGizmo(pickerScale)

      helperObject[TransformMode.translate] = setupGizmo(helperTranslate)
      helperObject[TransformMode.rotate] = setupGizmo(helperRotate)
      helperObject[TransformMode.scale] = setupGizmo(helperScale)
      for (const mode in TransformMode) {
        setComponent(gizmo[mode], NameComponent, `gizmo${mode}Entity`)
        addObjectToGroup(gizmo[mode], gizmoObject[mode])
        setComponent(gizmo[mode], TransformGizmoTagComponent)
        setComponent(gizmo[mode], VisibleComponent)
        setComponent(gizmo[mode], EntityTreeComponent, { parentEntity: Engine.instance.originEntity })

        visualComponent.gizmo[mode].set(gizmo[mode])

        setComponent(helper[mode], NameComponent, `gizmoHelper${mode}Entity`)
        addObjectToGroup(helper[mode], helperObject[mode])
        setComponent(helper[mode], TransformGizmoTagComponent)
        setComponent(helper[mode], VisibleComponent)
        setComponent(helper[mode], EntityTreeComponent, { parentEntity: Engine.instance.originEntity })

        visualComponent.helper[mode].set(helper[mode])

        setComponent(picker[mode], NameComponent, `gizmoPicker${mode}Entity`)
        pickerObject[mode].visible = false
        addObjectToGroup(picker[mode], pickerObject[mode])
        setComponent(picker[mode], TransformGizmoTagComponent)
        setComponent(picker[mode], VisibleComponent)
        setComponent(picker[mode], EntityTreeComponent, { parentEntity: Engine.instance.originEntity })

        visualComponent.picker[mode].set(picker[mode])

        setComponent(picker[mode], InputComponent)
      }

      return () => {
        for (const mode in TransformMode) {
          removeObjectFromGroup(gizmo[mode], gizmoObject[mode])
          cleanupGizmo(gizmoObject[mode])
          removeObjectFromGroup(picker[mode], pickerObject[mode])
          cleanupGizmo(pickerObject[mode])
          removeObjectFromGroup(helper[mode], helperObject[mode])
          cleanupGizmo(helperObject[mode])

          removeEntity(gizmo[mode])
          removeEntity(picker[mode])
          removeEntity(helper[mode])
        }
      }
    }, [])

    return null
  }
})
