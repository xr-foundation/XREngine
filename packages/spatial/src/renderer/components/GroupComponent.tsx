import React, { FC, memo, useLayoutEffect } from 'react'
import { Camera, Object3D } from 'three'

import {
  defineComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { QueryComponents, QueryReactor } from '@xrengine/ecs/src/QueryFunctions'
import { NO_PROXY, none } from '@xrengine/hyperflux'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { proxifyQuaternionWithDirty, proxifyVector3WithDirty } from '../../common/proxies/createThreejsProxy'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Layer } from './ObjectLayerComponent'

export type Object3DWithEntity = Object3D & { entity: Entity }

export const GroupComponent = defineComponent({
  name: 'GroupComponent',
  schema: S.Array(S.Type<Object3D>()),

  reactor: () => {
    const entity = useEntityContext()
    const groupComponent = useComponent(entity, GroupComponent)

    useLayoutEffect(() => {
      const group = groupComponent.get(NO_PROXY)
      return () => {
        if (!hasComponent(entity, GroupComponent)) for (const obj of group) obj.removeFromParent()
      }
    }, [groupComponent])

    return null
  }
})

export function addObjectToGroup(entity: Entity, object: Object3D) {
  const obj = object as Object3D & Camera
  obj.entity = entity

  if (!hasComponent(entity, GroupComponent)) setComponent(entity, GroupComponent, [])
  if (getComponent(entity, GroupComponent).includes(obj))
    return console.warn('[addObjectToGroup]: Tried to add an object that is already included', entity, object)
  if (!hasComponent(entity, TransformComponent)) setComponent(entity, TransformComponent)

  getMutableComponent(entity, GroupComponent).merge([obj])

  const transform = getComponent(entity, TransformComponent)
  obj.position.copy(transform.position)
  obj.quaternion.copy(transform.rotation)
  obj.scale.copy(transform.scale)
  obj.matrixAutoUpdate = false
  obj.matrixWorldAutoUpdate = false
  obj.matrix = transform.matrix
  obj.matrixWorld = transform.matrixWorld
  obj.layers = new Layer(entity)

  obj.frustumCulled = false

  Object.assign(obj, {
    updateWorldMatrix: () => {}
  })

  // sometimes it's convenient to update the entity transform via the Object3D,
  // so allow people to do that via proxies
  proxifyVector3WithDirty(TransformComponent.position, entity, TransformComponent.dirtyTransforms, obj.position)
  proxifyQuaternionWithDirty(TransformComponent.rotation, entity, TransformComponent.dirtyTransforms, obj.quaternion)
  proxifyVector3WithDirty(TransformComponent.scale, entity, TransformComponent.dirtyTransforms, obj.scale)
}

export function removeGroupComponent(entity: Entity) {
  if (hasComponent(entity, GroupComponent)) {
    for (const obj of getComponent(entity, GroupComponent)) obj.removeFromParent()
    removeComponent(entity, GroupComponent)
  }
}

export function removeObjectFromGroup(entity: Entity, object: Object3D) {
  const obj = object as Object3D & Camera

  if (hasComponent(entity, GroupComponent)) {
    const group = getComponent(entity, GroupComponent)
    if (group.includes(obj)) {
      getMutableComponent(entity, GroupComponent)[group.indexOf(obj)].set(none)
    }
    if (!group.length) removeComponent(entity, GroupComponent)
  }

  if (object.parent) object.removeFromParent()
}

export type GroupReactorProps = {
  entity: Entity
  obj: Object3D
}

export const GroupReactor = memo((props: { GroupChildReactor: FC<GroupReactorProps> }) => {
  const entity = useEntityContext()
  const groupComponent = useComponent(entity, GroupComponent)
  return (
    <>
      {groupComponent.value.map((obj, i) => (
        <props.GroupChildReactor key={obj.uuid} entity={entity} obj={obj as Object3D} />
      ))}
    </>
  )
})

export const GroupQueryReactor = memo(
  (props: { GroupChildReactor: FC<GroupReactorProps>; Components?: QueryComponents }) => {
    return (
      <QueryReactor
        Components={[GroupComponent, ...(props.Components ?? [])]}
        ChildEntityReactor={() => <GroupReactor GroupChildReactor={props.GroupChildReactor} />}
      />
    )
  }
)
