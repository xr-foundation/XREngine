import {
  Action,
  addOutgoingTopicIfNecessary,
  clearOutgoingActions,
  dispatchAction,
  getState,
  HyperFlux,
  PeerID
} from '@xrengine/hyperflux'

import { Network } from '../Network'
import { NetworkState } from '../NetworkState'

const receiveIncomingActions = (network: Network, fromPeerID: PeerID, actions: Required<Action>[]) => {
  if (network.isHosting) {
    for (const a of actions) {
      a.$network = network.id
      dispatchAction(a)
    }
  } else {
    for (const a of actions) {
      HyperFlux.store.actions.incoming.push(a)
    }
  }
}

const sendActionsAsPeer = (network: Network) => {
  const outgoing = HyperFlux.store.actions.outgoing[network.topic]
  if (!outgoing?.queue?.length) return
  const actions = [] as Action[]
  for (const action of outgoing.queue) {
    if (action.$network && !action.$topic && action.$network === network.id) action.$topic = network.topic
    if (action.$to === HyperFlux.store.peerID) continue
    actions.push(action)
  }
  // for (const peerID of network.peers) {
  network.messageToPeer(
    network.hostPeerID,
    /*encode(*/ actions //)
  )
  clearOutgoingActions(network.topic)
}

const sendActionsAsHost = (network: Network) => {
  addOutgoingTopicIfNecessary(network.topic)

  const actions = [...HyperFlux.store.actions.outgoing[network.topic].queue]
  if (!actions.length) return

  for (const peerID of Object.keys(network.peers) as PeerID[]) {
    const arr: Action[] = []
    for (const a of [...actions]) {
      const action = { ...a }
      if (action.$network) {
        if (action.$network !== network.id) continue
        else action.$topic = network.topic
      }
      if (!action.$to) continue
      if (action.$to === 'all' || (action.$to === 'others' && peerID !== action.$peer) || action.$to === peerID) {
        arr.push(action)
      }
    }
    if (arr.length)
      network.messageToPeer(
        peerID,
        /*encode(*/ arr //)
      )
  }

  // TODO: refactor this to support multiple connections of the same topic type
  clearOutgoingActions(network.topic)
}

const sendOutgoingActions = () => {
  for (const network of Object.values(getState(NetworkState).networks)) {
    try {
      if (HyperFlux.store.peerID === network.hostPeerID) sendActionsAsHost(network as Network)
      else sendActionsAsPeer(network as Network)
    } catch (e) {
      console.error(e)
    }
  }
}

export const NetworkActionFunctions = {
  sendActionsAsPeer,
  sendActionsAsHost,
  sendOutgoingActions,
  receiveIncomingActions
}
