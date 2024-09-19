
import { getMutableState, NetworkID, PeerID, UserID } from '@xrengine/hyperflux'

import { NetworkPeerFunctions } from '../src/functions/NetworkPeerFunctions'
import { createNetwork, NetworkTopics } from '../src/Network'
import { addNetwork, NetworkState } from '../src/NetworkState'

const instanceID = 'instanceID' as NetworkID
const hostPeerID = 'hostPeerID' as PeerID
const hostUserID = 'hostUserID' as UserID

export const createMockNetwork = (networkType = NetworkTopics.world) => {
  if (networkType === NetworkTopics.world) getMutableState(NetworkState).hostIds.world.set(instanceID)
  else getMutableState(NetworkState).hostIds.media.set(instanceID)
  const network = createNetwork(instanceID, hostPeerID, networkType)
  addNetwork(network)
  NetworkPeerFunctions.createPeer(network, hostPeerID, 0, hostUserID, 0)
}
