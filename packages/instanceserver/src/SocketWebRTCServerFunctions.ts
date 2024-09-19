import { Consumer, DataProducer, Producer, TransportInternal, WebRtcTransport } from 'mediasoup/node/lib/types'
import { encode } from 'msgpackr'

import { MediaStreamAppData } from '@xrengine/common/src/interfaces/NetworkInterfaces'
import { InstanceID } from '@xrengine/common/src/schema.type.module'
import { Action, getState, PeerID, Topic } from '@xrengine/hyperflux'
import { createNetwork, DataChannelType, NetworkActionFunctions, NetworkState } from '@xrengine/network'
import { Application } from '@xrengine/server-core/declarations'
import multiLogger from '@xrengine/server-core/src/ServerLogger'

import { InstanceServerState } from './InstanceServerState'
import { startWebRTC } from './WebRTCFunctions'

const logger = multiLogger.child({ component: 'instanceserver:webrtc:network' })

export type WebRTCTransportExtension = Omit<WebRtcTransport, 'appData'> & {
  appData: MediaStreamAppData
  internal: TransportInternal
}
export type ProducerExtension = Omit<Producer, 'appData'> & { appData: MediaStreamAppData }
export type ConsumerExtension = Omit<Consumer, 'appData'> & { appData: MediaStreamAppData }

export const initializeNetwork = async (app: Application, id: InstanceID, hostPeerID: PeerID, topic: Topic) => {
  const { workers, routers } = await startWebRTC()

  const outgoingDataTransport = await routers[0].createDirectTransport()

  logger.info('Server transport initialized.')

  const extension = {
    onMessage: (fromPeerID: PeerID, message: any) => {
      const networkPeer = network.peers[fromPeerID]
      if (!networkPeer) return

      networkPeer.lastSeenTs = Date.now()
      if (!message?.length) {
        // logger.info('Got heartbeat from ' + peerID + ' at ' + Date.now())
        return
      }

      const actions = /*decode(new Uint8Array(*/ message /*))*/ as Required<Action>[]
      NetworkActionFunctions.receiveIncomingActions(network, fromPeerID, actions)
    },

    bufferToPeer: (dataChannelType: DataChannelType, toPeerID: PeerID, data: any) => {
      /** @todo - server not yet able to send buffers to individual peers */
    },

    bufferToAll: (dataChannelType: DataChannelType, fromPeerID: PeerID, message: any) => {
      const dataProducer = network.outgoingDataProducers[dataChannelType]
      if (!dataProducer) return
      const fromPeerIndex = network.peerIDToPeerIndex[fromPeerID]
      if (typeof fromPeerIndex === 'undefined') return
      dataProducer.send(Buffer.from(new Uint8Array(encode([fromPeerIndex, message]))))
    },

    workers,
    routers,
    outgoingDataTransport,
    outgoingDataProducers: {} as Record<DataChannelType, DataProducer>
  }

  const network = createNetwork(id, hostPeerID, topic, extension)

  return network
}

export type SocketWebRTCServerNetwork = Awaited<ReturnType<typeof initializeNetwork>>

export const getServerNetwork = (app: Application) =>
  (getState(InstanceServerState).isMediaInstance
    ? NetworkState.mediaNetwork
    : NetworkState.worldNetwork) as SocketWebRTCServerNetwork
