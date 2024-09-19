
import { useEffect } from 'react'
import { Box3, Box3Helper, BufferGeometry, Mesh } from 'three'

import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  setComponent,
  useComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { Entity, UndefinedEntity } from '@xrengine/ecs/src/Entity'
import { createEntity, removeEntity, useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { getMutableState, useHookstate } from '@xrengine/hyperflux'
import { EntityTreeComponent, iterateEntityNode } from '@xrengine/spatial/src/transform/components/EntityTree'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { NameComponent } from '../../common/NameComponent'
import { addObjectToGroup, GroupComponent } from '../../renderer/components/GroupComponent'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { setObjectLayers } from '../../renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { ObjectLayers } from '../../renderer/constants/ObjectLayers'
import { RendererState } from '../../renderer/RendererState'

export const BoundingBoxComponent = defineComponent({
  name: 'BoundingBoxComponent',

  schema: S.Object({
    box: S.Class(() => new Box3()),
    helper: S.Entity()
  }),

  onSet: (entity, component, json) => {
    if (!json) return
    if (json.box?.isBox3) component.box.value.copy(json.box)
  },

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)
    const boundingBox = useComponent(entity, BoundingBoxComponent)

    useEffect(() => {
      updateBoundingBox(entity)

      if (!debugEnabled.value) return

      const helperEntity = createEntity()

      const helper = new Box3Helper(boundingBox.box.value)
      helper.name = `bounding-box-helper-${entity}`

      setComponent(helperEntity, NameComponent, helper.name)
      setComponent(helperEntity, VisibleComponent)

      setComponent(helperEntity, EntityTreeComponent, { parentEntity: entity })

      addObjectToGroup(helperEntity, helper)
      setObjectLayers(helper, ObjectLayers.NodeHelper)
      boundingBox.helper.set(helperEntity)

      return () => {
        removeEntity(helperEntity)
        if (!hasComponent(entity, BoundingBoxComponent)) return
        boundingBox.helper.set(UndefinedEntity)
      }
    }, [debugEnabled])

    return null
  }
})

export const updateBoundingBox = (entity: Entity) => {
  const boxComponent = getOptionalComponent(entity, BoundingBoxComponent)

  if (!boxComponent) {
    console.error('BoundingBoxComponent not found in updateBoundingBox')
    return
  }

  const box = boxComponent.box
  box.makeEmpty()

  const callback = (child: Entity) => {
    const obj = getOptionalComponent(child, MeshComponent)
    if (obj) expandBoxByObject(obj, box)
  }

  iterateEntityNode(entity, callback)

  /** helper has custom logic in updateMatrixWorld */
  const boundingBox = getComponent(entity, BoundingBoxComponent)
  const helperEntity = boundingBox.helper
  if (!helperEntity) return

  const helperObject = getComponent(helperEntity, GroupComponent)?.[0] as any as Box3Helper
  helperObject.updateMatrixWorld(true)
}

const _box = new Box3()

const expandBoxByObject = (object: Mesh<BufferGeometry>, box: Box3) => {
  const geometry = object.geometry

  if (geometry) {
    if (geometry.boundingBox === null) {
      geometry.computeBoundingBox()
    }

    _box.copy(geometry.boundingBox!)
    _box.applyMatrix4(object.matrixWorld)
    box.union(_box)
  }
}
