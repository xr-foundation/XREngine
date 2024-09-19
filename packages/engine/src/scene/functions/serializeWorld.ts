
import { UUIDComponent } from '@xrengine/ecs'
import {
  getAllComponents,
  getComponent,
  getOptionalComponent,
  hasComponent,
  serializeComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'
import { GLTFLoadedComponent } from '../components/GLTFLoadedComponent'
import { ComponentJsonType, EntityJsonType } from '../types/SceneTypes'

export const serializeEntity = (entity: Entity) => {
  const ignoreComponents = getOptionalComponent(entity, GLTFLoadedComponent)

  const jsonComponents = [] as ComponentJsonType[]
  const components = getAllComponents(entity)

  for (const component of components) {
    const sceneComponentID = component.jsonID
    if (sceneComponentID && !ignoreComponents?.includes(component.name)) {
      const data = serializeComponent(entity, component)
      if (data) {
        jsonComponents.push({
          name: sceneComponentID,
          props: data
        })
      }
    }
  }
  return jsonComponents
}

export const toEntityJson = (entity: Entity) => {
  const components = serializeEntity(entity)
  const result: EntityJsonType = {
    components,
    name: getOptionalComponent(entity, NameComponent) ?? ''
  }
  const parent = getOptionalComponent(entity, EntityTreeComponent)?.parentEntity
  if (parent && hasComponent(parent, UUIDComponent)) {
    result.parent = getComponent(parent, UUIDComponent)
  }
  return result
}

globalThis.serializeEntity = serializeEntity
