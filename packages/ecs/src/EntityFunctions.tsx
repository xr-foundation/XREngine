import * as bitECS from 'bitecs'
import React from 'react'
import { v4 as uuidv4 } from 'uuid'

import { HyperFlux } from '@xrengine/hyperflux'

import { removeAllComponents } from './ComponentFunctions'
import { Entity, EntityUUID, UndefinedEntity } from './Entity'

export const createEntity = (): Entity => {
  return bitECS.addEntity(HyperFlux.store) as Entity
}

export const removeEntity = (entity: Entity) => {
  if (!entity || !entityExists(entity)) return [] ///throw new Error(`[removeEntity]: Entity ${entity} does not exist in the world`)

  removeAllComponents(entity)

  bitECS.removeEntity(HyperFlux.store, entity)
}

export const entityExists = (entity: Entity) => {
  return bitECS.entityExists(HyperFlux.store, entity)
}

export const EntityContext = React.createContext(UndefinedEntity)

export const useEntityContext = () => {
  return React.useContext(EntityContext)
}

export const generateEntityUUID = () => {
  return uuidv4() as EntityUUID
}
