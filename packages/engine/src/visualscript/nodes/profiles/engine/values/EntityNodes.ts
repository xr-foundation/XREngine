import { cloneDeep, isEqual, uniqueId } from 'lodash'

import { UUIDComponent } from '@xrengine/ecs'
import { ComponentMap, getComponent, hasComponent, setComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Engine } from '@xrengine/ecs/src/Engine'
import { Entity, EntityUUID, UndefinedEntity } from '@xrengine/ecs/src/Entity'
import { removeEntity } from '@xrengine/ecs/src/EntityFunctions'
import { defineQuery } from '@xrengine/ecs/src/QueryFunctions'
import { SystemUUID, defineSystem, destroySystem } from '@xrengine/ecs/src/SystemFunctions'
import { InputSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import { teleportAvatar } from '@xrengine/engine/src/avatar/functions/moveAvatar'
import { SourceComponent } from '@xrengine/engine/src/scene/components/SourceComponent'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { RigidBodyComponent } from '@xrengine/spatial/src/physics/components/RigidBodyComponent'
import { copyTransformToRigidBody } from '@xrengine/spatial/src/physics/systems/PhysicsPreTransformSystem'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'
import {
  NodeCategory,
  makeEventNodeDefinition,
  makeFlowNodeDefinition,
  makeFunctionNodeDefinition,
  makeInNOutFunctionDesc,
  toQuat,
  toVector3
} from '@xrengine/visual-script'

import { addEntityToScene } from '../helper/entityHelper'

type State = {
  systemUUID: SystemUUID
}
const initialState = (): State => ({
  systemUUID: '' as SystemUUID
})

const sceneQuery = defineQuery([SourceComponent])

export const getEntity = makeFunctionNodeDefinition({
  typeName: 'logic/entity/get/entityInScene',
  category: NodeCategory.Logic,
  label: 'Get entity in scene',
  in: {
    entity: (_) => {
      const choices = sceneQuery().map((entity) => ({
        text: getComponent(entity, NameComponent),
        value: getComponent(entity, UUIDComponent) as string
      }))
      return {
        valueType: 'string',
        choices: choices,
        defaultValue: ''
      }
    }
  },
  out: { entity: 'entity' },
  exec: ({ read, write }) => {
    const entityUUID = read<EntityUUID>('entity')
    const entity = UUIDComponent.getEntityByUUID(entityUUID)
    write('entity', entity)
  }
})

export const getLocalClientEntity = makeFunctionNodeDefinition({
  typeName: 'logic/entity/get/localClientEntity',
  category: NodeCategory.Logic,
  label: 'Get local client entity',
  in: {},
  out: { entity: 'entity' },
  exec: ({ write }) => {
    const entity = AvatarComponent.getSelfAvatarEntity()
    write('entity', entity)
  }
})

export const getCameraEntity = makeFunctionNodeDefinition({
  typeName: 'logic/entity/get/cameraEntity',
  category: NodeCategory.Logic,
  label: 'Get camera entity',
  in: {},
  out: { entity: 'entity' },
  exec: ({ write }) => {
    const entity = Engine.instance.cameraEntity
    write('entity', entity)
  }
})

export const entityExists = makeFlowNodeDefinition({
  typeName: 'logic/entity/exists',
  category: NodeCategory.Logic,
  label: 'Entity exists',
  in: {
    flow: 'flow',
    entity: 'entity'
  },
  out: {
    flow: 'flow',
    exists: 'boolean',
    entity: 'entity',
    uuid: 'string',
    position: 'vec3',
    rotation: 'quat',
    scale: 'vec3',
    matrix: 'mat4'
  },
  initialState: undefined,
  triggered: ({ read, write, commit }) => {
    const entity: Entity = read('entity')
    if (!entity) {
      write('exists', false)
    } else {
      write('exists', true)
      write('entity', entity)
      const transform = getComponent(entity, TransformComponent)
      write('position', transform.position)
      write('rotation', transform.rotation)
      write('scale', transform.scale)
      write('matrix', transform.matrix)
      write('uuid', getComponent(entity, UUIDComponent) as string)
    }
    commit('flow')
  }
})

export const addEntity = makeFlowNodeDefinition({
  typeName: 'logic/entity/addEntity',
  category: NodeCategory.Logic,
  label: 'Add entity',
  in: {
    flow: 'flow',
    parentEntity: (_) => {
      const choices = sceneQuery().map((entity) => ({
        text: getComponent(entity, NameComponent),
        value: getComponent(entity, UUIDComponent) as string
      }))
      return {
        valueType: 'string',
        choices: choices,
        defaultValue: ''
      }
    },
    componentName: (_) => {
      const choices = Array.from(ComponentMap.entries())
        .filter(([, component]) => !!component.jsonID)
        .map(([name]) => name)
        .sort()
      return {
        valueType: 'string',
        choices: choices,
        defaultValue: TransformComponent.name
      }
    },
    entityName: 'string'
  },
  out: { flow: 'flow', entity: 'entity' },
  initialState: undefined,
  triggered: ({ read, write, commit }) => {
    const parentEntityUUID = read<EntityUUID>('parentEntity')
    const parentEntity: Entity =
      parentEntityUUID == '' ? UndefinedEntity : UUIDComponent.getEntityByUUID(parentEntityUUID)
    const componentName = read<string>('componentName')
    const entity = addEntityToScene([{ name: ComponentMap.get(componentName)!.jsonID! }], parentEntity)
    const entityName = read<string>('entityName')
    if (entityName.length > 0) setComponent(entity, NameComponent, entityName)
    write('entity', entity)
    commit('flow')
  }
})

export const deleteEntity = makeFlowNodeDefinition({
  typeName: 'logic/entity/deleteEntity',
  category: NodeCategory.Logic,
  label: 'Delete entity',
  in: {
    flow: 'flow',
    entityUUID: (_) => {
      const choices = sceneQuery().map((entity) => ({
        text: getComponent(entity, NameComponent),
        value: getComponent(entity, UUIDComponent) as string
      }))
      choices.unshift({ text: 'none', value: '' })
      return {
        valueType: 'string',
        choices: choices // no default beacause we dont want to acciedently delete the default, none is safer
      }
    }
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit }) => {
    const entityUUID: EntityUUID = read('entityUUID')
    const entity = UUIDComponent.getEntityByUUID(entityUUID)
    removeEntity(entity)
    commit('flow')
  }
})

export const getEntityTransform = makeFunctionNodeDefinition({
  typeName: 'engine/entity/TransformComponent/get',
  category: NodeCategory.Engine,
  label: 'Get entity transform',
  in: {
    entity: 'entity'
  },
  out: { entity: 'entity', position: 'vec3', rotation: 'quat', scale: 'vec3', matrix: 'mat4' },
  exec: ({ read, write }) => {
    const entity = Number(read('entity')) as Entity
    const transform = getComponent(entity, TransformComponent)
    write('position', transform.position)
    write('rotation', transform.rotation)
    write('scale', transform.scale)
    write('matrix', transform.matrix)
    write('entity', entity)
  }
})

export const setEntityTransform = makeFlowNodeDefinition({
  typeName: 'engine/entity/TransformComponent/set',
  category: NodeCategory.Engine,
  label: 'set transformComponent',
  in: {
    flow: 'flow',
    entity: 'entity',
    position: 'vec3',
    rotation: 'quat',
    scale: 'vec3'
  },
  out: { flow: 'flow', entity: 'entity' },
  initialState: undefined,
  triggered: ({ read, write, commit }) => {
    const position = toVector3(read('position'))
    const rotation = toQuat(read('rotation'))
    const scale = toVector3(read('scale'))
    const entity = Number(read('entity')) as Entity
    if (entity === AvatarComponent.getSelfAvatarEntity()) {
      teleportAvatar(entity, position!, true)
    } else {
      setComponent(entity, TransformComponent, { position: position!, rotation: rotation!, scale: scale! })
      if (hasComponent(entity, RigidBodyComponent)) copyTransformToRigidBody(entity)
    }
    write('entity', entity)
    commit('flow')
  }
})

export const useEntityTransform = makeEventNodeDefinition({
  typeName: 'engine/entity/TransformComponent/use',
  category: NodeCategory.Engine,
  label: 'Use entity transform',
  in: {
    entity: 'entity'
  },
  out: {
    entity: 'entity',
    positionChange: 'flow',
    position: 'vec3',
    rotationChange: 'flow',
    rotation: 'quat',
    scaleChange: 'flow',
    scale: 'vec3'
  },
  initialState: initialState(),
  init: ({ read, commit, write }) => {
    const entity = Number(read('entity')) as Entity
    const prevTransform = {}
    const systemUUID = defineSystem({
      uuid: 'visual-script-useTransform-' + uniqueId(),
      insert: { with: InputSystemGroup },
      execute: () => {
        const transform = getComponent(entity, TransformComponent)
        Object.entries(transform).forEach(([key, value]) => {
          if (!Object.keys(useEntityTransform.out).includes(key)) return
          if (Object.hasOwn(prevTransform, key)) {
            if (isEqual(prevTransform[key], transform[key])) return
          }
          write(key as any, value)
          commit(`${key}Change` as any)
          prevTransform[key] = cloneDeep(transform[key])
        })
      },
      reactor: () => {
        /*const transformState = useComponent(entity, TransformComponent)
        Object.entries(transformState.value).forEach(([key, value]) => {
          if (!Object.keys(useEntityTransform.out).includes(key)) return
          useEffect(() => {
            write(key as any, value)
            commit(`${key}Change` as any)
          }, [transformState[key]])
        })*/
        return null
      }
    })
    const state: State = {
      systemUUID
    }
    write('entity', entity)

    return state
  },
  dispose: ({ state: { systemUUID } }) => {
    destroySystem(systemUUID)
    return initialState()
  }
})

export const getUUID = makeInNOutFunctionDesc({
  name: 'logic/entity/getUuid',
  label: 'Entity uuid',
  in: ['entity'],
  out: 'string',
  exec: (entity: Entity) => getComponent(entity, UUIDComponent)
})

export const Constant = makeInNOutFunctionDesc({
  name: 'logic/entity/constant',
  label: 'Entity',
  in: ['entity'],
  out: 'entity',
  exec: (a: Entity) => a
})

export const Equal = makeInNOutFunctionDesc({
  name: 'logic/entity/compare/equal',
  label: 'Entity =',
  in: ['entity', 'entity'],
  out: 'boolean',
  exec: (a: Entity, b: Entity) => a === b
})
