
import { Engine } from '@xrengine/ecs/src/Engine'
import { Action, getMutableState, none, PeerID, UserID } from '@xrengine/hyperflux'

import { Network } from '../Network'
import { NetworkState } from '../NetworkState'

function createPeer(network: Network, peerID: PeerID, peerIndex: number, userID: UserID, userIndex: number) {
  const networkState = getMutableState(NetworkState).networks[network.id]

  networkState.userIDToUserIndex[userID].set(userIndex)
  networkState.userIndexToUserID[userIndex].set(userID)
  networkState.peerIDToPeerIndex[peerID].set(peerIndex)
  networkState.peerIndexToPeerID[peerIndex].set(peerID)

  networkState.peers[peerID].merge({
    peerID,
    peerIndex,
    userId: userID,
    userIndex
  })

  if (!network.users[userID]) {
    networkState.users.merge({ [userID]: [peerID] })
  } else {
    if (!network.users[userID]!.includes(peerID)) networkState.users[userID].merge([peerID])
  }
}

function destroyPeer(network: Network, peerID: PeerID) {
  if (!network.peers[peerID])
    return console.warn(`[NetworkPeerFunctions]: tried to remove client with peerID ${peerID} that doesn't exit`)

  if (peerID === Engine.instance.store.peerID)
    return console.warn(`[NetworkPeerFunctions]: tried to remove local client`)

  // reactively set
  const userID = network.peers[peerID]!.userId

  const networkState = getMutableState(NetworkState).networks[network.id]
  networkState.peers[peerID].set(none)

  const userIndex = network.userIDToUserIndex[userID]!
  networkState.userIDToUserIndex[userID].set(none)
  networkState.userIndexToUserID[userIndex].set(none)

  const peerIndex = network.peerIDToPeerIndex[peerID]!
  networkState.peerIDToPeerIndex[peerID].set(none)
  networkState.peerIndexToPeerID[peerIndex].set(none)

  const userPeers = network.users[userID]!
  const peerIndexInUserPeers = userPeers.indexOf(peerID)
  userPeers.splice(peerIndexInUserPeers, 1)
  if (!userPeers.length) networkState.users[userID].set(none)
}

function getCachedActionsForPeer(toPeerID: PeerID) {
  // send all cached and outgoing actions to joining user
  const cachedActions = [] as Required<Action>[]
  for (const action of Engine.instance.store.actions.cached) {
    if (action.$peer === toPeerID) continue
    if (action.$to === 'all' || action.$to === toPeerID) cachedActions.push({ ...action, $stack: undefined! })
  }

  return cachedActions
}

export const NetworkPeerFunctions = {
  createPeer,
  destroyPeer,
  getCachedActionsForPeer
}
