
import { act, render } from '@testing-library/react'
import assert from 'assert'
import React from 'react'

import {
  Engine,
  EntityUUID,
  SystemDefinitions,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  destroyEngine,
  removeEntity,
  setComponent
} from '@xrengine/ecs'
import { createEngine } from '@xrengine/ecs/src/Engine'
import { PeerID, UserID, applyIncomingActions, dispatchAction, getState } from '@xrengine/hyperflux'
import {
  Network,
  NetworkPeerFunctions,
  NetworkState,
  NetworkTopics,
  NetworkWorldUserStateSystem
} from '@xrengine/network'
import { createMockNetwork } from '../../../../network/tests/createMockNetwork'
import { SpectateActions, SpectateEntityState } from './SpectateSystem'

describe('SpectateSystem', async () => {
  let viewerEntity = UndefinedEntity

  describe('SpectateEntityState', async () => {
    beforeEach(async () => {
      createEngine()
      createMockNetwork()
      Engine.instance.store.defaultDispatchDelay = () => 0
      viewerEntity = createEntity()
      setComponent(viewerEntity, UUIDComponent, UUIDComponent.generateUUID())
    })

    afterEach(() => {
      removeEntity(viewerEntity)
      return destroyEngine()
    })

    it('should start spectating an entity when the `spectateEntity` action is dispatched', async () => {
      const NetworkWorldUserStateSystemReactor = SystemDefinitions.get(NetworkWorldUserStateSystem)!.reactor!
      const tag = <NetworkWorldUserStateSystemReactor />

      const hostUserId = 'world' as UserID
      const userId = 'user id' as UserID
      const userUuid = userId as any as EntityUUID
      const peerID = Engine.instance.store.peerID
      const peerID2 = 'peer id 2' as PeerID
      const peerID3 = 'peer id 3' as PeerID
      const spectatorID = 'spectator id' as UserID

      Engine.instance.store.userID = userId
      const network: Network = NetworkState.worldNetwork

      NetworkPeerFunctions.createPeer(network, peerID, 0, hostUserId, 0)
      NetworkPeerFunctions.createPeer(network, peerID2, 1, userId, 1)
      NetworkPeerFunctions.createPeer(network, peerID3, 2, userId, 2)

      const { rerender, unmount } = render(tag)
      await act(() => rerender(tag))

      dispatchAction(
        SpectateActions.spectateEntity({
          spectatorUserID: spectatorID,
          spectatingEntity: userUuid,
          $topic: NetworkTopics.world,
          $peer: Engine.instance.store.peerID
        })
      )
      applyIncomingActions()
      const state = getState(SpectateEntityState)[spectatorID]
      assert.notEqual(state, undefined, "The spectator's SpectateEntityState should not be undefined after `getState`")
      assert.equal(state.spectating, userId, 'The spectator is not spectating the correct userID')

      unmount()
    })

    it('should stop spectating an entity when the `exitSpectate` action is dispatched', async () => {
      const NetworkWorldUserStateSystemReactor = SystemDefinitions.get(NetworkWorldUserStateSystem)!.reactor!
      const tag = <NetworkWorldUserStateSystemReactor />

      const hostUserId = 'world' as UserID
      const userId = 'user id' as UserID
      const userUuid = userId as any as EntityUUID
      const peerID = Engine.instance.store.peerID
      const peerID2 = 'peer id 2' as PeerID
      const peerID3 = 'peer id 3' as PeerID
      const spectatorID = 'spectator id' as UserID

      Engine.instance.store.userID = userId
      const network: Network = NetworkState.worldNetwork

      NetworkPeerFunctions.createPeer(network, peerID, 0, hostUserId, 0)
      NetworkPeerFunctions.createPeer(network, peerID2, 1, userId, 1)
      NetworkPeerFunctions.createPeer(network, peerID3, 2, userId, 2)

      const { rerender, unmount } = render(tag)
      await act(() => rerender(tag))

      dispatchAction(
        SpectateActions.spectateEntity({
          spectatorUserID: spectatorID,
          spectatingEntity: userUuid,
          $topic: NetworkTopics.world,
          $peer: Engine.instance.store.peerID
        })
      )
      applyIncomingActions()
      const before = getState(SpectateEntityState)[spectatorID]
      assert.notEqual(before, undefined, "The spectator's SpectateEntityState should not be undefined after `getState`")
      assert.equal(before.spectating, userId, 'The spectator is not spectating the correct userID')

      dispatchAction(
        SpectateActions.exitSpectate({
          spectatorUserID: spectatorID,
          $topic: NetworkTopics.world,
          $peer: Engine.instance.store.peerID
        })
      )
      applyIncomingActions()
      const after = getState(SpectateEntityState)[spectatorID]
      assert.equal(after, undefined, "The spectator's SpectateEntityState should be undefined after exitSpectate")

      unmount()
    })
  })
})
