
import * as bitECS from 'bitecs'
import { getAllEntities } from 'bitecs'

import * as Hyperflux from '@xrengine/hyperflux'
import {
  createHyperStore,
  disposeStore,
  getState,
  HyperFlux,
  HyperStore,
  NO_PROXY_STEALTH,
  ReactorReconciler
} from '@xrengine/hyperflux'

import { ECSState } from './ECSState'
import { Entity } from './Entity'
import { removeEntity } from './EntityFunctions'
import { removeQuery } from './QueryFunctions'
import { SystemState } from './SystemState'

export class Engine {
  static instance: Engine

  /**
   * @deprecated use "Engine.instance.store.userID" instead
   * The uuid of the logged-in user
   */
  get userID() {
    return Engine.instance.store.userID
  }

  store: HyperStore

  /**
   * Represents the reference space of the xr session local floor.
   * @deprecated use "getState(EngineState).localFloorEntity" instead
   */
  get localFloorEntity() {
    return Engine.instance.store.stateMap['EngineState'].get(NO_PROXY_STEALTH).localFloorEntity as Entity
  }

  /**
   * Represents the reference space for the absolute origin of the rendering context.
   * @deprecated use "getState(EngineState).originEntity" instead
   */
  get originEntity() {
    return Engine.instance.store.stateMap['EngineState'].get(NO_PROXY_STEALTH).originEntity as Entity
  }

  /**
   * Represents the reference space for the viewer.
   * @deprecated use "getState(EngineState).viewerEntity" instead
   */
  get viewerEntity() {
    return Engine.instance.store.stateMap['EngineState'].get(NO_PROXY_STEALTH).viewerEntity as Entity
  }

  /** @deprecated use viewerEntity instead */
  get cameraEntity() {
    return this.viewerEntity
  }
}

globalThis.Engine = Engine
globalThis.Hyperflux = Hyperflux

export function createEngine(hyperstore = createHyperStore()) {
  if (Engine.instance) throw new Error('Store already exists')
  Engine.instance = new Engine()
  hyperstore.getCurrentReactorRoot = () =>
    getState(SystemState).activeSystemReactors.get(getState(SystemState).currentSystemUUID)
  hyperstore.getDispatchTime = () => getState(ECSState).simulationTime
  Engine.instance.store = bitECS.createWorld(hyperstore) as HyperStore
  const UndefinedEntity = bitECS.addEntity(hyperstore)
}

export function destroyEngine() {
  getState(ECSState).timer?.clear()

  /** Remove all entities */
  const entities = getAllEntities(HyperFlux.store) as Entity[]

  ReactorReconciler.flushSync(() => {
    for (const entity of entities) removeEntity(entity)
  })

  for (const query of getState(SystemState).reactiveQueryStates) {
    removeQuery(query.query)
  }

  disposeStore()

  /** @todo include in next bitecs update */
  // bitecs.deleteWorld(Engine.instance)
  Engine.instance = null!
}
