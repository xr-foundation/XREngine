import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { SimulationSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { dispatchAction } from '@xrengine/hyperflux'

import { NetworkActionFunctions } from '../functions/NetworkActionFunctions'
import { Network } from '../Network'
import { NetworkActions, PeersUpdateType } from '../NetworkState'

/** Publish to connected peers that peer information has changed */
export const updatePeers = (network: Network) => {
  const peers = Object.values(network.peers).map((peer) => {
    return {
      peerID: peer.peerID,
      peerIndex: peer.peerIndex,
      userID: peer.userId,
      userIndex: peer.userIndex
    }
  }) as Array<PeersUpdateType>
  const action = NetworkActions.updatePeers({
    peers,
    $topic: network.topic,
    $network: network.id
  })
  dispatchAction(action)
  return action
}

const execute = () => {
  NetworkActionFunctions.sendOutgoingActions()
}

export const OutgoingActionSystem = defineSystem({
  uuid: 'xrengine.engine.OutgoingActionSystem',
  insert: { after: SimulationSystemGroup },
  execute
})
