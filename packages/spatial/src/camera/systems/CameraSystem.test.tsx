
import { act, render } from '@testing-library/react'
import assert from 'assert'
import React from 'react'

import {
  Engine,
  SystemDefinitions,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  destroyEngine,
  getComponent,
  hasComponent,
  removeEntity,
  setComponent
} from '@xrengine/ecs'
import { createEngine } from '@xrengine/ecs/src/Engine'
import { PeerID, UserID, applyIncomingActions, dispatchAction } from '@xrengine/hyperflux'
import {
  Network,
  NetworkPeerFunctions,
  NetworkState,
  NetworkTopics,
  NetworkWorldUserStateSystem
} from '@xrengine/network'
import { NetworkId } from '@xrengine/network/src/NetworkId'
import { createMockNetwork } from '../../../../network/tests/createMockNetwork'
import { CameraActions } from '../CameraState'
import { CameraComponent } from '../components/CameraComponent'

describe('CameraSystem', async () => {
  let viewerEntity = UndefinedEntity

  describe('CameraEntityState', async () => {
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

    it('should create a camera entity and apply a CameraComponent to that entity', async () => {
      const NetworkWorldUserStateSystemReactor = SystemDefinitions.get(NetworkWorldUserStateSystem)!.reactor!
      const tag = <NetworkWorldUserStateSystemReactor />

      const hostUserId = 'world' as UserID
      const userId = 'user id' as UserID
      const peerID = Engine.instance.store.peerID
      const peerID2 = 'peer id 2' as PeerID
      const CameraUUID = UUIDComponent.generateUUID()

      Engine.instance.store.userID = userId
      const network: Network = NetworkState.worldNetwork

      NetworkPeerFunctions.createPeer(network, peerID, 0, hostUserId, 0)
      NetworkPeerFunctions.createPeer(network, peerID2, 1, userId, 1)
      const objNetId = 3 as NetworkId

      const { rerender, unmount } = render(tag)
      await act(() => rerender(tag))

      dispatchAction(
        CameraActions.spawnCamera({
          parentUUID: getComponent(viewerEntity, UUIDComponent),
          entityUUID: CameraUUID,
          ownerID: network.hostUserID, // from  host
          networkId: objNetId,
          $topic: NetworkTopics.world,
          $peer: Engine.instance.store.peerID
        })
      )
      applyIncomingActions()

      const cameraEntity = UUIDComponent.getEntityByUUID(CameraUUID)
      assert.ok(cameraEntity, "The spawnCamera Action didn't create an entity.")
      assert.ok(
        hasComponent(cameraEntity, CameraComponent),
        "The spawnCamera Action didn't apply the CameraComponent to the entity"
      )

      unmount()
    })
  })
})
