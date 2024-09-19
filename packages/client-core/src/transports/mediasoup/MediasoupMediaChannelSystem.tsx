import React, { useEffect } from 'react'

import { InstanceID } from '@xrengine/common/src/schema.type.module'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import {
  dispatchAction,
  getMutableState,
  getState,
  NetworkID,
  useHookstate,
  useMutableState
} from '@xrengine/hyperflux'

import logger from '@xrengine/common/src/logger'
import {
  MediasoupMediaConsumerActions,
  MediasoupMediaConsumerType,
  MediasoupMediaProducerConsumerState,
  MediasoupMediaProducersConsumersObjectsState
} from '@xrengine/common/src/transports/mediasoup/MediasoupMediaProducerConsumerState'
import { MediasoupTransportState } from '@xrengine/common/src/transports/mediasoup/MediasoupTransportState'
import { Engine, PresentationSystemGroup } from '@xrengine/ecs'
import { NetworkState } from '@xrengine/network'
import { ConsumerExtension, SocketWebRTCClientNetwork, WebRTCTransportExtension } from './MediasoupClientFunctions'

export const receiveConsumerHandler = async (networkID: NetworkID, consumerState: MediasoupMediaConsumerType) => {
  const network = getState(NetworkState).networks[networkID] as SocketWebRTCClientNetwork

  const { peerID, mediaTag, channelID, paused } = consumerState

  const transport = MediasoupTransportState.getTransport(network.id, 'recv') as WebRTCTransportExtension
  if (!transport) return logger.error('No transport found for consumer')

  const consumer = (await transport.consume({
    id: consumerState.consumerID,
    producerId: consumerState.producerID,
    rtpParameters: consumerState.rtpParameters as any,
    kind: consumerState.kind!,
    appData: { peerID, mediaTag, channelId: channelID }
  })) as unknown as ConsumerExtension

  // if we do already have a consumer, we shouldn't have called this method
  const existingConsumer = MediasoupMediaProducerConsumerState.getConsumerByPeerIdAndMediaTag(
    network.id,
    peerID,
    mediaTag
  ) as ConsumerExtension

  if (!existingConsumer) {
    getMutableState(MediasoupMediaProducersConsumersObjectsState).consumers[consumer.id].set(consumer)
    // okay, we're ready. let's ask the peer to send us media
    if (!paused) MediasoupMediaProducerConsumerState.resumeConsumer(network, consumer.id)
    else MediasoupMediaProducerConsumerState.pauseConsumer(network, consumer.id)
  } else if (existingConsumer.track?.muted) {
    dispatchAction(
      MediasoupMediaConsumerActions.consumerClosed({
        consumerID: existingConsumer.id,
        $network: network.id,
        $topic: network.topic,
        $to: peerID
      })
    )
    getMutableState(MediasoupMediaProducersConsumersObjectsState).consumers[consumer.id].set(consumer)
    // okay, we're ready. let's ask the peer to send us media
    if (!paused) {
      MediasoupMediaProducerConsumerState.resumeConsumer(network, consumer.id)
    } else {
      MediasoupMediaProducerConsumerState.pauseConsumer(network, consumer.id)
    }
  } else {
    dispatchAction(
      MediasoupMediaConsumerActions.consumerClosed({
        consumerID: consumer.id,
        $network: network.id,
        $topic: network.topic,
        $to: peerID
      })
    )
  }
}

const ConsumerReactor = (props: { consumerID: string; networkID: InstanceID }) => {
  const { consumerID, networkID } = props
  const consumer = useMutableState(MediasoupMediaProducerConsumerState)[networkID].consumers[consumerID].value

  useEffect(() => {
    receiveConsumerHandler(networkID, consumer)
  }, [])

  return null
}

/**
 * Network producer reactor
 * - Requests consumer for a peer's producer
 * @param props
 * @returns
 */
export const NetworkProducer = (props: { networkID: InstanceID; producerID: string }) => {
  const { networkID, producerID } = props
  const producerState = useHookstate(
    getMutableState(MediasoupMediaProducerConsumerState)[networkID].producers[producerID]
  )
  const networkState = useHookstate(getMutableState(NetworkState).networks[networkID])

  useEffect(() => {
    if (!networkState.ready?.value) return

    const peerID = producerState.peerID.value
    // dont need to request our own consumers
    if (peerID === Engine.instance.store.peerID) return

    const mediaTag = producerState.mediaTag.value
    const channelID = producerState.channelID.value
    const network = getState(NetworkState).networks[networkID] as SocketWebRTCClientNetwork

    dispatchAction(
      MediasoupMediaConsumerActions.requestConsumer({
        mediaTag,
        peerID,
        rtpCapabilities: network.mediasoupDevice.rtpCapabilities,
        channelID,
        $topic: network.topic,
        $to: network.hostPeerID
      })
    )
  }, [networkState.ready?.value])

  return null
}

const NetworkReactor = (props: { networkID: InstanceID }) => {
  const { networkID } = props
  const mediaProducerConsumerState = useMutableState(MediasoupMediaProducerConsumerState)[networkID]
  return (
    <>
      {mediaProducerConsumerState?.producers?.keys.map((producerID: string) => (
        <NetworkProducer key={producerID} producerID={producerID} networkID={networkID} />
      ))}
      {mediaProducerConsumerState?.consumers?.keys?.map((consumerID) => (
        <ConsumerReactor key={consumerID} consumerID={consumerID} networkID={networkID} />
      ))}
    </>
  )
}

const reactor = () => {
  const mediaProducerConsumerState = useMutableState(MediasoupMediaProducerConsumerState)

  return (
    <>
      {mediaProducerConsumerState.keys.map((id: InstanceID) => (
        <NetworkReactor key={id} networkID={id} />
      ))}
    </>
  )
}

export const MediasoupMediaChannelSystem = defineSystem({
  uuid: 'xrengine.client.MediasoupMediaChannelSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
