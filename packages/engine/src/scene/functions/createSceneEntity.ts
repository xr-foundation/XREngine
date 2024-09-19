
import {
  Entity,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  generateEntityUUID,
  getOptionalComponent,
  setComponent
} from '@xrengine/ecs'
import { TransformComponent } from '@xrengine/spatial'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { addObjectToGroup } from '@xrengine/spatial/src/renderer/components/GroupComponent'
import { Object3DComponent } from '@xrengine/spatial/src/renderer/components/Object3DComponent'
import { VisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'
import { Group } from 'three'
import { proxifyParentChildRelationships } from './loadGLTFModel'

import { SourceComponent } from '../components/SourceComponent'

export const createSceneEntity = (name: string, parentEntity: Entity = UndefinedEntity): Entity => {
  const entity = createEntity()
  setComponent(entity, NameComponent, name)
  setComponent(entity, VisibleComponent)
  setComponent(entity, TransformComponent)
  if (parentEntity !== UndefinedEntity) {
    setComponent(entity, EntityTreeComponent, { parentEntity })
  }
  const sceneID = getOptionalComponent(parentEntity, SourceComponent)
  if (sceneID != null) {
    setComponent(entity, SourceComponent, sceneID)
  }

  setComponent(entity, UUIDComponent, generateEntityUUID())

  // These additional properties and relations are required for
  // the current GLTF exporter to successfully generate a GLTF.
  const obj3d = new Group()
  obj3d.entity = entity
  addObjectToGroup(entity, obj3d)
  proxifyParentChildRelationships(obj3d)
  setComponent(entity, Object3DComponent, obj3d)

  return entity
}
