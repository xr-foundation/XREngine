
import React, { useEffect, useLayoutEffect } from 'react'

import { Engine, EntityUUID, getOptionalComponent, removeEntity, setComponent, UUIDComponent } from '@xrengine/ecs'
import {
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  none,
  PeerID,
  useHookstate,
  useMutableState,
  UserID
} from '@xrengine/hyperflux'
import { NetworkId } from '@xrengine/network/src/NetworkId'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'

import { WorldNetworkAction } from './functions/WorldNetworkAction'
import { NetworkObjectComponent } from './NetworkObjectComponent'
import { NetworkState, SceneUser } from './NetworkState'
import { NetworkWorldUserState } from './NetworkUserState'

export const EntityNetworkState = defineState({
  name: 'xrengine.EntityNetworkState',

  initial: {} as Record<
    EntityUUID,
    {
      parentUUID: EntityUUID
      ownerId: UserID | typeof SceneUser
      ownerPeer: PeerID
      networkId: NetworkId
      authorityPeerId: PeerID
      requestingPeerId?: PeerID
    }
  >,

  receptors: {
    onSpawnObject: WorldNetworkAction.spawnEntity.receive((action) => {
      // const userId = getState(NetworkState).networks[action.$network].peers[action.$peer].userId
      getMutableState(EntityNetworkState)[action.entityUUID].merge({
        parentUUID: action.parentUUID,
        ownerId: action.ownerID,
        networkId: action.networkId,
        authorityPeerId: action.authorityPeerId ?? action.$peer,
        ownerPeer: action.$peer
      })
    }),

    onRequestAuthorityOverObject: WorldNetworkAction.requestAuthorityOverObject.receive((action) => {
      getMutableState(EntityNetworkState)[action.entityUUID].requestingPeerId.set(action.newAuthority)
    }),

    onTransferAuthorityOfObject: WorldNetworkAction.transferAuthorityOfObject.receive((action) => {
      const fromUserId = action.ownerID
      const state = getMutableState(EntityNetworkState)
      const ownerUserId = state[action.entityUUID].ownerId.value
      if (fromUserId !== ownerUserId) return // Authority transfer can only be initiated by owner
      state[action.entityUUID].authorityPeerId.set(action.newAuthority)
      state[action.entityUUID].requestingPeerId.set(none)
    }),

    onDestroyObject: WorldNetworkAction.destroyEntity.receive((action) => {
      getMutableState(EntityNetworkState)[action.entityUUID].set(none)
    })
  },

  reactor: () => {
    const state = useMutableState(EntityNetworkState)
    return (
      <>
        {state.keys.map((uuid: EntityUUID) => (
          <EntityNetworkReactor uuid={uuid} key={uuid} />
        ))}
      </>
    )
  }
})

const EntityNetworkReactor = (props: { uuid: EntityUUID }) => {
  const state = useHookstate(getMutableState(EntityNetworkState)[props.uuid])
  const ownerID = state.ownerId.value
  const isOwner = ownerID === SceneUser || ownerID === Engine.instance.userID
  const userConnected = !!useHookstate(getMutableState(NetworkWorldUserState)[ownerID]).value || isOwner
  const isWorldNetworkConnected = !!useHookstate(NetworkState.worldNetworkState).value

  useLayoutEffect(() => {
    if (!userConnected) return
    const entity =
      ownerID === SceneUser
        ? UUIDComponent.getEntityByUUID(props.uuid)
        : UUIDComponent.getOrCreateEntityByUUID(props.uuid)
    return () => {
      removeEntity(entity)
    }
  }, [userConnected])

  useLayoutEffect(() => {
    if (!userConnected) return
    const entity = UUIDComponent.getEntityByUUID(props.uuid)
    const parentEntity = UUIDComponent.getEntityByUUID(state.parentUUID.value)
    if (!parentEntity || !entity) return
    setComponent(entity, EntityTreeComponent, { parentEntity })
  }, [userConnected, state.parentUUID])

  useLayoutEffect(() => {
    if (!userConnected) return
    const entity = UUIDComponent.getEntityByUUID(props.uuid)
    if (!entity) return
    const worldNetwork = NetworkState.worldNetwork

    setComponent(entity, NetworkObjectComponent, {
      ownerId:
        ownerID === SceneUser ? (isWorldNetworkConnected ? worldNetwork.hostUserID : Engine.instance.userID) : ownerID,
      ownerPeer: state.ownerPeer.value,
      authorityPeerID: state.authorityPeerId.value,
      networkId: state.networkId.value
    })
  }, [isWorldNetworkConnected, userConnected, state.ownerId.value, state.authorityPeerId.value, state.networkId.value])

  useLayoutEffect(() => {
    if (!userConnected || !state.requestingPeerId.value) return
    // Authority request can only be processed by owner

    const entity = UUIDComponent.getEntityByUUID(props.uuid)
    if (!entity) return
    const ownerID = getOptionalComponent(entity, NetworkObjectComponent)?.ownerId
    if (!ownerID || ownerID !== Engine.instance.userID) return
    console.log('Requesting authority over object', props.uuid, state.requestingPeerId.value)
    dispatchAction(
      WorldNetworkAction.transferAuthorityOfObject({
        ownerID: state.ownerId.value,
        entityUUID: props.uuid,
        newAuthority: state.requestingPeerId.value
      })
    )
  }, [userConnected, state.requestingPeerId.value])

  return <>{isOwner && isWorldNetworkConnected && <OwnerPeerReactor uuid={props.uuid} />}</>
}

const OwnerPeerReactor = (props: { uuid: EntityUUID }) => {
  const state = useHookstate(getMutableState(EntityNetworkState)[props.uuid])
  const ownerPeer = state.ownerPeer.value
  const networkState = useHookstate(NetworkState.worldNetworkState)

  /** If the owner peer does not exist in the network, and we are the owner user, dispatch a spawn action so we take ownership */
  useEffect(() => {
    return () => {
      // ensure reactor isn't completely unmounting
      if (!getState(EntityNetworkState)[props.uuid]) return
      if (ownerPeer !== Engine.instance.store.peerID && Engine.instance.store.userID === state.ownerId.value) {
        const lowestPeer = [...networkState.users[Engine.instance.userID].value].sort((a, b) => (a > b ? 1 : -1))[0]
        if (lowestPeer !== Engine.instance.store.peerID) return
        dispatchAction(
          WorldNetworkAction.spawnEntity({
            entityUUID: props.uuid,
            parentUUID: state.parentUUID.value,
            // if the authority peer is not connected, we need to take authority
            authorityPeerId: networkState.users[Engine.instance.userID].value.includes(ownerPeer)
              ? undefined
              : Engine.instance.store.peerID
          })
        )
      }
    }
  }, [networkState.peers, networkState.users])

  return null
}
