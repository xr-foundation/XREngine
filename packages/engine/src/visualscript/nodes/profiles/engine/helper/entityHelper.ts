
import { UUIDComponent } from '@xrengine/ecs'
import { ComponentJSONIDMap, getComponent, hasComponent, setComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity, UndefinedEntity } from '@xrengine/ecs/src/Entity'
import { createEntity, generateEntityUUID } from '@xrengine/ecs/src/EntityFunctions'
import { ComponentJsonType } from '@xrengine/engine/src/scene/types/SceneTypes'
import { VisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'

export const addEntityToScene = (
  componentJson: Array<ComponentJsonType>,
  parentEntity = UndefinedEntity,
  beforeEntity = UndefinedEntity as Entity
) => {
  const newEntity = createEntity()
  let childIndex = undefined as undefined | number
  if (beforeEntity) {
    const beforeNode = getComponent(beforeEntity, EntityTreeComponent)
    if (beforeNode?.parentEntity && hasComponent(beforeNode.parentEntity, EntityTreeComponent)) {
      childIndex = getComponent(beforeNode.parentEntity, EntityTreeComponent).children.indexOf(beforeEntity)
    }
  }
  setComponent(newEntity, EntityTreeComponent, { parentEntity, childIndex })
  setComponent(newEntity, TransformComponent)
  const uuid = generateEntityUUID()
  setComponent(newEntity, UUIDComponent, uuid)
  setComponent(newEntity, VisibleComponent)
  for (const component of componentJson) {
    if (ComponentJSONIDMap.has(component.name))
      setComponent(newEntity, ComponentJSONIDMap.get(component.name)!, component.props)
  }

  return newEntity
}
