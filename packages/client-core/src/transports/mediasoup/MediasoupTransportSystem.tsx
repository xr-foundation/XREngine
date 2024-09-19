
import React, { useEffect, useLayoutEffect } from 'react'

import { InstanceID } from '@xrengine/common/src/schema.type.module'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { getMutableState, getState, useHookstate, useMutableState } from '@xrengine/hyperflux'

import '@xrengine/common/src/transports/mediasoup/MediasoupDataProducerConsumerState'
import '@xrengine/common/src/transports/mediasoup/MediasoupMediaProducerConsumerState'
import '@xrengine/common/src/transports/mediasoup/MediasoupTransportState'

import '@xrengine/network/src/NetworkPeerState'

import { NetworkState } from '@xrengine/network'

import {
  MediasoupTransportObjectsState,
  MediasoupTransportState
} from '@xrengine/common/src/transports/mediasoup/MediasoupTransportState'
import { WebRTCTransportExtension, onTransportCreated } from './MediasoupClientFunctions'

const TransportReactor = (props: { transportID: string; networkID: InstanceID }) => {
  useEffect(() => {
    const transport = getState(MediasoupTransportState)[props.networkID][props.transportID]
    onTransportCreated(props.networkID, transport)
  }, [])
  return null
}

const NetworkConnectionReactor = (props: { networkID: InstanceID }) => {
  const transportState = useMutableState(MediasoupTransportState)[props.networkID]
  const transportObjectState = useMutableState(MediasoupTransportObjectsState)
  const networkState = useMutableState(NetworkState).networks[props.networkID]

  useLayoutEffect(() => {
    if (!networkState.value) return
    const topic = networkState.topic.value
    const topicEnabled = getState(NetworkState).config[topic]
    if (topicEnabled) {
      const sendTransport = MediasoupTransportState.getTransport(props.networkID, 'send') as WebRTCTransportExtension
      const recvTransport = MediasoupTransportState.getTransport(props.networkID, 'recv') as WebRTCTransportExtension
      networkState.ready.set(!!recvTransport && !!sendTransport)
    } else {
      networkState.ready.set(true)
    }
  }, [transportObjectState, networkState])

  return (
    <>
      {transportState.keys?.map((transportID: string) => (
        <TransportReactor key={transportID} transportID={transportID} networkID={props.networkID} />
      ))}
    </>
  )
}

const reactor = () => {
  const networkConfig = useHookstate(getMutableState(NetworkState).config)
  const isOnline = networkConfig.world.value || networkConfig.media.value
  const networkIDs = Object.keys(useHookstate(getMutableState(NetworkState).networks).value)

  /** @todo - instead of checking for network config, we should filter NetworkConnectionReactor by networks with a "real" transport */
  if (!isOnline) return null

  return (
    <>
      {networkIDs.map((id: InstanceID) => (
        <NetworkConnectionReactor key={id} networkID={id} />
      ))}
    </>
  )
}

export const MediasoupTransportSystem = defineSystem({
  uuid: 'xrengine.client.MediasoupTransportSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
