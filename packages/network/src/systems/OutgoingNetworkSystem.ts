
import { Engine } from '@xrengine/ecs/src/Engine'
import { defineQuery } from '@xrengine/ecs/src/QueryFunctions'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { SimulationSystemGroup } from '@xrengine/ecs/src/SystemGroups'

import { Network } from '../Network'
import { NetworkObjectAuthorityTag, NetworkObjectComponent } from '../NetworkObjectComponent'
import { NetworkState } from '../NetworkState'
import { createDataWriter } from '../serialization/DataWriter'
import { ecsDataChannelType } from './IncomingNetworkSystem'

/***********
 * QUERIES *
 **********/

export const networkQuery = defineQuery([NetworkObjectComponent, NetworkObjectAuthorityTag])

const serializeAndSend = (serialize: ReturnType<typeof createDataWriter>) => {
  const ents = networkQuery()
  if (ents.length > 0) {
    const network = NetworkState.worldNetwork as Network
    const peerID = Engine.instance.store.peerID
    const data = serialize(network, peerID, ents)

    // todo: insert historian logic here

    if (data.byteLength > 0) {
      // side effect - network IO
      // delay until end of frame
      Promise.resolve().then(() => network.bufferToAll(ecsDataChannelType, peerID, data))
    }
  }
}

const serialize = createDataWriter()

const execute = () => {
  NetworkState.worldNetwork && serializeAndSend(serialize)
}

export const OutgoingNetworkSystem = defineSystem({
  uuid: 'xrengine.engine.OutgoingNetworkSystem',
  insert: { after: SimulationSystemGroup },
  execute
})
