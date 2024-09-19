
import assert, { strictEqual } from 'assert'

import { EntityUUID, getComponent, UUIDComponent } from '@xrengine/ecs'
import { ECSState } from '@xrengine/ecs/src/ECSState'
import { createEngine, destroyEngine, Engine } from '@xrengine/ecs/src/Engine'
import { ActionRecipients, applyIncomingActions, getMutableState, getState, UserID } from '@xrengine/hyperflux'
import { initializeSpatialEngine } from '@xrengine/spatial/src/initializeEngine'
import { SpawnObjectActions } from '@xrengine/spatial/src/transform/SpawnObjectActions'

import { createMockNetwork } from '../../tests/createMockNetwork'
import { NetworkTopics } from '../Network'

describe('IncomingActionSystem Unit Tests', async () => {
  beforeEach(() => {
    createEngine()
    // this is hacky but works and preserves the logic
    Engine.instance.store.getDispatchTime = () => {
      return getState(ECSState).simulationTime
    }
    createMockNetwork()
    initializeSpatialEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('applyIncomingActions', () => {
    it('should delay incoming action from the future', () => {
      // fixed tick in past
      const ecsState = getMutableState(ECSState)
      ecsState.simulationTime.set(0)

      /* mock */
      const action = SpawnObjectActions.spawnObject({
        parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
        ownerID: '0' as UserID,
        // incoming action from future
        $time: 2,
        $to: '0' as ActionRecipients,
        entityUUID: '0' as EntityUUID
      })
      action.$topic = NetworkTopics.world

      Engine.instance.store.actions.incoming.push(action)

      /* run */
      applyIncomingActions()

      /* assert */
      strictEqual(Engine.instance.store.actions.history.length, 0)

      // fixed tick update
      ecsState.simulationTime.set(2)
      applyIncomingActions()

      /* assert */
      strictEqual(Engine.instance.store.actions.history.length, 1)
    })

    it('should immediately apply incoming action from the past or present', () => {
      /* mock */
      const action = SpawnObjectActions.spawnObject({
        parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
        ownerID: '0' as UserID,
        // incoming action from past
        $time: -1,
        $to: '0' as ActionRecipients,
        entityUUID: '0' as EntityUUID
      })
      action.$topic = NetworkTopics.world

      Engine.instance.store.actions.incoming.push(action)

      /* run */
      applyIncomingActions()

      /* assert */
      strictEqual(Engine.instance.store.actions.history.length, 1)
    })
  })

  describe('applyAndArchiveIncomingAction', () => {
    it('should cache actions where $cache = true', () => {
      /* mock */
      const action = SpawnObjectActions.spawnObject({
        parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
        ownerID: '0' as UserID,
        // incoming action from past
        $time: 0,
        $to: '0' as ActionRecipients,
        $cache: true,
        entityUUID: '0' as EntityUUID
      })
      action.$topic = NetworkTopics.world

      Engine.instance.store.actions.incoming.push(action)

      /* run */
      applyIncomingActions()

      /* assert */
      strictEqual(Engine.instance.store.actions.history.length, 1)
      assert(Engine.instance.store.actions.cached.indexOf(action) !== -1)
    })
  })
})
