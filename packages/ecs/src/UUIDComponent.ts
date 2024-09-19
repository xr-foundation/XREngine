import { v4 as uuidv4 } from 'uuid'

import { hookstate, NO_PROXY_STEALTH, State, useHookstate } from '@xrengine/hyperflux'

import { defineComponent, setComponent } from './ComponentFunctions'
import { Entity, EntityUUID, UndefinedEntity } from './Entity'
import { createEntity } from './EntityFunctions'
import { S } from './schemas/JSONSchemas'

export const UUIDComponent = defineComponent({
  name: 'UUIDComponent',
  jsonID: 'XRENGINE_uuid',

  schema: S.EntityUUID(),

  onSet: (entity, component, uuid: EntityUUID) => {
    if (!uuid) throw new Error('UUID cannot be empty')

    if (component.value === uuid) return

    // throw error if uuid is already in use
    const currentEntity = UUIDComponent.getEntityByUUID(uuid)
    if (currentEntity !== UndefinedEntity && currentEntity !== entity) {
      throw new Error(`UUID ${uuid} is already in use`)
    }

    // remove old uuid
    if (component.value) {
      const currentUUID = component.value
      _getUUIDState(currentUUID).set(UndefinedEntity)
    }

    // set new uuid
    component.set(uuid)
    _getUUIDState(uuid).set(entity)
  },

  onRemove: (entity, component) => {
    const uuid = component.value
    _getUUIDState(uuid).set(UndefinedEntity)
  },

  entitiesByUUIDState: {} as Record<EntityUUID, State<Entity>>,

  useEntityByUUID(uuid: EntityUUID) {
    return useHookstate(_getUUIDState(uuid)).value
  },

  getEntityByUUID(uuid: EntityUUID) {
    return _getUUIDState(uuid).get(NO_PROXY_STEALTH)
  },

  getOrCreateEntityByUUID(uuid: EntityUUID) {
    const state = _getUUIDState(uuid)
    if (!state.value) {
      const entity = createEntity()
      setComponent(entity, UUIDComponent, uuid)
    }
    return state.value
  },

  generateUUID() {
    return uuidv4() as EntityUUID
  }
})

function _getUUIDState(uuid: EntityUUID) {
  let entityState = UUIDComponent.entitiesByUUIDState[uuid]
  if (!entityState) {
    entityState = hookstate(UndefinedEntity)
    UUIDComponent.entitiesByUUIDState[uuid] = entityState
  }
  return entityState
}
