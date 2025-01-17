
import { act, render } from '@testing-library/react'
import assert from 'assert'
import React from 'react'

import { EntityUUID, generateEntityUUID, UUIDComponent } from '@xrengine/ecs'
import { getComponent, hasComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { createEngine, destroyEngine, Engine } from '@xrengine/ecs/src/Engine'
import { defineQuery } from '@xrengine/ecs/src/QueryFunctions'
import { SystemDefinitions } from '@xrengine/ecs/src/SystemFunctions'
import { applyIncomingActions, dispatchAction, PeerID, ReactorReconciler, UserID } from '@xrengine/hyperflux'
import { initializeSpatialEngine } from '@xrengine/spatial/src/initializeEngine'

import { createMockNetwork } from '../tests/createMockNetwork'
import { Network, NetworkTopics } from './Network'

import './EntityNetworkState'

import { NetworkPeerFunctions } from './functions/NetworkPeerFunctions'
import { WorldNetworkAction } from './functions/WorldNetworkAction'
import { NetworkId } from './NetworkId'
import { NetworkObjectComponent, NetworkObjectOwnedTag } from './NetworkObjectComponent'
import { NetworkState } from './NetworkState'
import { NetworkWorldUserStateSystem } from './NetworkUserState'

describe('EntityNetworkState', () => {
  beforeEach(async () => {
    createEngine()
    createMockNetwork()
    Engine.instance.store.defaultDispatchDelay = () => 0
    initializeSpatialEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  const NetworkWorldUserStateSystemReactor = SystemDefinitions.get(NetworkWorldUserStateSystem)!.reactor!
  const tag = <NetworkWorldUserStateSystemReactor />

  describe('spawnObject', () => {
    it('should spawn object owned by host', async () => {
      const hostUserId = 'world' as UserID
      const userId = 'user id' as UserID
      const peerID = Engine.instance.store.peerID
      const peerID2 = 'peer id 2' as PeerID

      Engine.instance.store.userID = userId
      const network = NetworkState.worldNetwork as Network

      NetworkPeerFunctions.createPeer(network, peerID, 0, hostUserId, 0)
      NetworkPeerFunctions.createPeer(network, peerID2, 1, userId, 1)

      const { rerender, unmount } = render(tag)
      await act(() => rerender(tag))

      const objNetId = 3 as NetworkId

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
          ownerID: network.hostUserID, // from  host
          networkId: objNetId,
          $topic: NetworkTopics.world,
          $peer: Engine.instance.store.peerID,
          entityUUID: (Engine.instance.userID + '_entity') as any as EntityUUID
        })
      )

      ReactorReconciler.flushSync(() => applyIncomingActions())

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntities = networkObjectQuery()
      const networkObjectOwnedEntities = networkObjectOwnedQuery()

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 0)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, objNetId)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).authorityPeerID, peerID)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectOwnedTag), false)

      unmount()
    })

    it('should spawn object owned by user', async () => {
      const userId = 'user id' as UserID
      const hostId = 'host' as UserID
      const peerID = 'peer id' as PeerID
      const peerID2 = Engine.instance.store.peerID

      Engine.instance.store.userID = userId

      const network = NetworkState.worldNetwork as Network

      NetworkPeerFunctions.createPeer(network, peerID, 0, hostId, 0)
      NetworkPeerFunctions.createPeer(network, peerID2, 1, userId, 1)

      const { rerender, unmount } = render(tag)
      await act(() => rerender(tag))

      const objNetId = 3 as NetworkId

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
          ownerID: userId, // from  user
          networkId: objNetId,
          $peer: Engine.instance.store.peerID,
          entityUUID: Engine.instance.store.peerID as any as EntityUUID
        })
      )

      ReactorReconciler.flushSync(() => applyIncomingActions())

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntities = networkObjectQuery()
      const networkObjectOwnedEntities = networkObjectOwnedQuery()

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 1)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, objNetId)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).authorityPeerID, peerID2)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectOwnedTag), true)

      unmount()
    })

    it('should spawn avatar owned by other', async () => {
      const hostUserId = 'world' as UserID
      const userId = 'user id' as UserID
      const userId2 = 'second user id' as UserID
      const peerID = Engine.instance.store.peerID
      const peerID2 = 'peer id 2' as PeerID
      const peerID3 = 'peer id 3' as PeerID

      Engine.instance.store.userID = userId
      const network = NetworkState.worldNetwork as Network

      NetworkPeerFunctions.createPeer(network, peerID, 0, hostUserId, 0)
      NetworkPeerFunctions.createPeer(network, peerID2, 1, userId, 1)
      NetworkPeerFunctions.createPeer(network, peerID3, 2, userId2, 2)

      const { rerender, unmount } = render(tag)
      await act(() => rerender(tag))

      const objNetId = 3 as NetworkId

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
          ownerID: userId2, // from other user
          networkId: objNetId,
          $peer: peerID3,
          $topic: NetworkTopics.world,
          entityUUID: peerID3 as any as EntityUUID
        })
      )

      ReactorReconciler.flushSync(() => applyIncomingActions())

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntities = networkObjectQuery()
      const networkObjectOwnedEntities = networkObjectOwnedQuery()

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 0)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, objNetId)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).authorityPeerID, peerID3)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectOwnedTag), false)

      unmount()
    })

    it('should spawn avatar owned by user', async () => {
      const userId = 'user id' as UserID
      const peerID = Engine.instance.store.peerID

      Engine.instance.store.userID = userId
      const network = NetworkState.worldNetwork as Network

      NetworkPeerFunctions.createPeer(network, peerID, 1, userId, 1)

      const { rerender, unmount } = render(tag)
      await act(() => rerender(tag))

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
          networkId: 42 as NetworkId,
          $peer: peerID,
          entityUUID: Engine.instance.userID as string as EntityUUID
        })
      )

      ReactorReconciler.flushSync(() => applyIncomingActions())

      const entity = UUIDComponent.getEntityByUUID(Engine.instance.userID as any as EntityUUID)

      assert.equal(getComponent(entity, NetworkObjectComponent).networkId, 42)
      assert.equal(getComponent(entity, NetworkObjectComponent).authorityPeerID, peerID)
      assert.equal(hasComponent(entity, NetworkObjectOwnedTag), true)

      unmount()
    })
  })

  describe('transfer authority of object', () => {
    it('should transfer authority of object (and not ownership)', async () => {
      const hostUserId = 'world' as UserID
      const hostPeerId = 'host peer id' as PeerID
      const userId = 'user id' as UserID
      const peerID = Engine.instance.store.peerID
      const peerID2 = 'peer id 2' as PeerID

      Engine.instance.store.userID = userId
      const network = NetworkState.worldNetwork as Network

      NetworkPeerFunctions.createPeer(network, hostPeerId, 0, hostUserId, 0)
      NetworkPeerFunctions.createPeer(network, peerID, 0, userId, 1)
      NetworkPeerFunctions.createPeer(network, peerID2, 1, userId, 1)

      const { rerender, unmount } = render(tag)
      await act(() => rerender(tag))

      const objNetId = 3 as NetworkId

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
          ownerID: userId,
          networkId: objNetId,
          $topic: NetworkTopics.world,
          $peer: peerID,
          entityUUID: peerID as any as EntityUUID
        })
      )

      ReactorReconciler.flushSync(() => applyIncomingActions())

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntitiesBefore = networkObjectQuery()
      const networkObjectOwnedEntitiesBefore = networkObjectOwnedQuery()

      assert.equal(networkObjectEntitiesBefore.length, 1)
      assert.equal(networkObjectOwnedEntitiesBefore.length, 1)

      assert.equal(getComponent(networkObjectEntitiesBefore[0], NetworkObjectComponent).ownerId, userId)
      assert.equal(getComponent(networkObjectEntitiesBefore[0], NetworkObjectComponent).authorityPeerID, peerID)
      assert.equal(hasComponent(networkObjectEntitiesBefore[0], NetworkObjectOwnedTag), true)

      dispatchAction(
        WorldNetworkAction.requestAuthorityOverObject({
          entityUUID: peerID as any as EntityUUID,
          $topic: NetworkTopics.world,
          newAuthority: peerID2
        })
      )

      ReactorReconciler.flushSync(() => applyIncomingActions())
      ReactorReconciler.flushSync(() => applyIncomingActions())

      const networkObjectEntitiesAfter = networkObjectQuery()
      const networkObjectOwnedEntitiesAfter = networkObjectOwnedQuery()

      assert.equal(networkObjectEntitiesAfter.length, 1)
      assert.equal(networkObjectOwnedEntitiesAfter.length, 1)

      assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).ownerId, userId) // owner remains same
      assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).authorityPeerID, peerID2) // peer has changed
      assert.equal(hasComponent(networkObjectEntitiesAfter[0], NetworkObjectOwnedTag), true)

      unmount()
    })
  })

  it('should not transfer authority if it is not the owner', async () => {
    const hostUserId = 'world' as UserID
    const hostPeerId = 'host peer id' as PeerID
    const userId = 'user id' as UserID
    const peerID = Engine.instance.store.peerID
    const peerID2 = 'peer id 2' as PeerID

    Engine.instance.store.userID = userId // user being the action dispatcher
    const network = NetworkState.worldNetwork as Network

    NetworkPeerFunctions.createPeer(network, hostPeerId, 0, hostUserId, 0)
    NetworkPeerFunctions.createPeer(network, peerID, 0, userId, 1)
    NetworkPeerFunctions.createPeer(network, peerID2, 1, userId, 1)

    const { rerender, unmount } = render(tag)
    await act(() => rerender(tag))

    const objNetId = 3 as NetworkId

    dispatchAction(
      WorldNetworkAction.spawnEntity({
        parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
        ownerID: hostUserId, // from  host
        networkId: objNetId,
        $topic: NetworkTopics.world,
        $peer: Engine.instance.store.peerID,
        entityUUID: Engine.instance.store.peerID as any as EntityUUID
      })
    )

    ReactorReconciler.flushSync(() => applyIncomingActions())

    const networkObjectQuery = defineQuery([NetworkObjectComponent])
    const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

    const networkObjectEntitiesBefore = networkObjectQuery()
    const networkObjectOwnedEntitiesBefore = networkObjectOwnedQuery()

    assert.equal(networkObjectEntitiesBefore.length, 1)
    assert.equal(networkObjectOwnedEntitiesBefore.length, 0)

    assert.equal(getComponent(networkObjectEntitiesBefore[0], NetworkObjectComponent).ownerId, hostUserId)
    assert.equal(getComponent(networkObjectEntitiesBefore[0], NetworkObjectComponent).authorityPeerID, peerID)
    assert.equal(hasComponent(networkObjectEntitiesBefore[0], NetworkObjectOwnedTag), false)

    dispatchAction(
      WorldNetworkAction.requestAuthorityOverObject({
        entityUUID: Engine.instance.store.peerID as any as EntityUUID,
        $topic: NetworkTopics.world,
        newAuthority: peerID2
      })
    )

    ReactorReconciler.flushSync(() => applyIncomingActions())

    const networkObjectEntitiesAfter = networkObjectQuery()
    const networkObjectOwnedEntitiesAfter = networkObjectOwnedQuery()

    assert.equal(networkObjectEntitiesAfter.length, 1)
    assert.equal(networkObjectOwnedEntitiesAfter.length, 0)

    assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).ownerId, hostUserId) // owner remains same
    assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).authorityPeerID, peerID) // peer remains same
    assert.equal(hasComponent(networkObjectEntitiesAfter[0], NetworkObjectOwnedTag), false)

    unmount()
  })

  it.skip('benchmark 10000 entities spawn', async () => {
    const hostUserId = 'world' as UserID
    const hostPeerId = 'host peer id' as PeerID
    const userId = 'user id' as UserID
    const peerID = Engine.instance.store.peerID
    const peerID2 = 'peer id 2' as PeerID

    Engine.instance.store.userID = userId // user being the action dispatcher
    const network = NetworkState.worldNetwork as Network

    NetworkPeerFunctions.createPeer(network, hostPeerId, 0, hostUserId, 0)
    NetworkPeerFunctions.createPeer(network, peerID, 0, userId, 1)
    NetworkPeerFunctions.createPeer(network, peerID2, 1, userId, 1)

    const objNetId = 3 as NetworkId

    const { rerender, unmount } = render(tag)
    await act(() => rerender(tag))

    const start = performance.now()

    for (let i = 0; i < 10000; i++) {
      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
          ownerID: hostUserId, // from  host
          networkId: objNetId,
          $topic: NetworkTopics.world,
          $peer: Engine.instance.store.peerID,
          entityUUID: generateEntityUUID()
        })
      )
    }

    ReactorReconciler.flushSync(() => applyIncomingActions())

    const applyActionsEnd = performance.now()
    console.log('10000 entities apply action time:', applyActionsEnd - start)

    const reactorEnd = performance.now()

    console.log('10000 entities reactor time:', reactorEnd - applyActionsEnd)

    const runner1End = performance.now()

    console.log('10000 entities unchanged runner time:', runner1End - reactorEnd)

    dispatchAction(
      WorldNetworkAction.spawnEntity({
        parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
        ownerID: hostUserId, // from  host
        networkId: objNetId,
        $topic: NetworkTopics.world,
        $peer: Engine.instance.store.peerID,
        entityUUID: generateEntityUUID()
      })
    )

    ReactorReconciler.flushSync(() => applyIncomingActions())

    const runner2End = performance.now()

    console.log('10000 entities 1 new entity runner time:', runner2End - runner1End)
    console.log('10000 entities total time:', runner2End - start)

    unmount()
  })
})
