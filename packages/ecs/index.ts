
// ensure dependency modules are imported
import '@xrengine/hyperflux'

import { getAllEntities, Not, Types } from 'bitecs'

import {
  defineComponent,
  getAllComponentData,
  getAllComponents,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  getOptionalMutableComponent,
  hasComponent,
  removeAllComponents,
  removeComponent,
  serializeComponent,
  setComponent,
  updateComponent,
  useComponent,
  useOptionalComponent
} from './src/ComponentFunctions'
import { executeFixedSystem, executeSystems, getDAG } from './src/EngineFunctions'
import { UndefinedEntity } from './src/Entity'
import { createEntity, entityExists, removeEntity, useEntityContext } from './src/EntityFunctions'
import { defineQuery, QueryReactor, removeQuery, useQuery } from './src/QueryFunctions'
import { defineSystem, destroySystem, executeSystem, useExecute } from './src/SystemFunctions'
import { UUIDComponent } from './src/UUIDComponent'

const ECS = {
  /** Component API */
  defineComponent,
  getOptionalMutableComponent,
  getMutableComponent,
  getOptionalComponent,
  getComponent,
  setComponent,
  updateComponent,
  hasComponent,
  removeComponent,
  getAllComponents,
  getAllComponentData,
  removeAllComponents,
  serializeComponent,
  useComponent,
  useOptionalComponent,
  UUIDComponent,
  /** Entity API */
  createEntity,
  removeEntity,
  entityExists,
  useEntityContext,
  UndefinedEntity,
  /** System API */
  executeSystem,
  defineSystem,
  useExecute,
  destroySystem,
  /** Queries */
  defineQuery,
  removeQuery,
  useQuery,
  QueryReactor,
  /** Pipeline Functions */
  executeSystems,
  executeFixedSystem,
  getDAG,
  /** bitECS Functions */
  Not,
  Types,
  getAllEntities
}

globalThis.ECS = ECS

export default ECS

export { Not } from 'bitecs'
export * from './src/ComponentFunctions'
export * from './src/ECSState'
export * from './src/Engine'
export * from './src/EngineFunctions'
export * from './src/Entity'
export * from './src/EntityFunctions'
export * from './src/QueryFunctions'
export * from './src/schemas/ECSSchemas'
export * from './src/schemas/JSONSchemas'
export * from './src/schemas/JSONSchemaTypes'
export * from './src/SystemFunctions'
export * from './src/SystemGroups'
export * from './src/Timer'
export * from './src/UUIDComponent'
export { ECS }
