
import { useEffect } from 'react'

import { ECSState } from '@xrengine/ecs/src/ECSState'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { SimulationSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { defineState, getState, PeerID } from '@xrengine/hyperflux'

import { addDataChannelHandler, DataChannelType, removeDataChannelHandler } from '../DataChannelRegistry'
import { RingBuffer } from '../functions/RingBuffer'
import { JitterBufferEntry, Network } from '../Network'
import { NetworkState } from '../NetworkState'
import { readDataPacket } from '../serialization/DataReader'

const toArrayBuffer = (buf) => {
  const ab = new ArrayBuffer(buf.length)
  const view = new Uint8Array(ab)
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return ab
}

export const IncomingNetworkState = defineState({
  name: 'xrengine.core.network.IncomingNetworkState',
  initial: () => ({
    jitterBufferTaskList: [] as JitterBufferEntry[],
    jitterBufferDelay: 100,
    incomingMessageQueueUnreliableIDs: new RingBuffer<PeerID>(100),
    incomingMessageQueueUnreliable: new RingBuffer<any>(100)
  })
})

export const ecsDataChannelType = 'xrengine.core.ecs.dataChannel' as DataChannelType
const handleNetworkdata = (
  network: Network,
  dataChannel: DataChannelType,
  fromPeerID: PeerID,
  message: ArrayBufferLike
) => {
  const { incomingMessageQueueUnreliable, incomingMessageQueueUnreliableIDs } = getState(IncomingNetworkState)
  if (network.isHosting) {
    incomingMessageQueueUnreliable.add(toArrayBuffer(message))
    incomingMessageQueueUnreliableIDs.add(fromPeerID)
    // forward data to clients in world immediately
    // TODO: need to include the userId (or index), so consumers can validate
    network.bufferToAll(ecsDataChannelType, fromPeerID, message)
  } else {
    incomingMessageQueueUnreliable.add(message)
    incomingMessageQueueUnreliableIDs.add(fromPeerID)
  }
}

function oldestFirstComparator(a: JitterBufferEntry, b: JitterBufferEntry) {
  return b.simulationTime - a.simulationTime
}

const execute = () => {
  const ecsState = getState(ECSState)

  const { jitterBufferTaskList, jitterBufferDelay, incomingMessageQueueUnreliable, incomingMessageQueueUnreliableIDs } =
    getState(IncomingNetworkState)

  const network = NetworkState.worldNetwork
  if (!network) return

  while (incomingMessageQueueUnreliable.getBufferLength() > 0) {
    // we may need producer IDs at some point, likely for p2p netcode, for now just consume it
    incomingMessageQueueUnreliableIDs.pop()
    const packet = incomingMessageQueueUnreliable.pop()

    readDataPacket(network, packet, jitterBufferTaskList)
  }

  jitterBufferTaskList.sort(oldestFirstComparator)

  const targetFixedTime = ecsState.simulationTime + jitterBufferDelay

  for (const [index, { simulationTime, read }] of jitterBufferTaskList.slice().entries()) {
    if (simulationTime <= targetFixedTime) {
      read()
      jitterBufferTaskList.splice(index, 1)
    }
  }
}

const reactor = () => {
  useEffect(() => {
    addDataChannelHandler(ecsDataChannelType, handleNetworkdata)
    return () => {
      removeDataChannelHandler(ecsDataChannelType, handleNetworkdata)
    }
  }, [])
  return null
}

export const IncomingNetworkSystem = defineSystem({
  uuid: 'xrengine.engine.IncomingNetworkSystem',
  insert: { before: SimulationSystemGroup },
  execute,
  reactor
})
