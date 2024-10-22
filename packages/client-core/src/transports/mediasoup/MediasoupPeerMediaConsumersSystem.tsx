
import React, { useEffect } from 'react'

import { clientSettingPath, InstanceID } from '@xrengine/common/src/schema.type.module'
import {
  MediasoupMediaProducerConsumerState,
  MediasoupMediaProducersConsumersObjectsState
} from '@xrengine/common/src/transports/mediasoup/MediasoupMediaProducerConsumerState'
import { Engine } from '@xrengine/ecs/src/Engine'
import { getMutableState, PeerID, useHookstate, useMutableState } from '@xrengine/hyperflux'
import {
  NetworkState,
  screenshareAudioDataChannelType,
  screenshareVideoDataChannelType,
  VideoConstants,
  webcamAudioDataChannelType
} from '@xrengine/network'

import { useFind } from '@xrengine/common'
import { defineSystem, PresentationSystemGroup } from '@xrengine/ecs'
import { MediaSettingsState } from '@xrengine/engine/src/audio/MediaSettingsState'
import { useMediaNetwork } from '../../common/services/MediaInstanceConnectionService'
import { MediaStreamState } from '../../media/MediaStreamState'
import {
  createPeerMediaChannels,
  PeerMediaChannelState,
  removePeerMediaChannels
} from '../../media/PeerMediaChannelState'
import { ConsumerExtension, ProducerExtension } from './MediasoupClientFunctions'

const MAX_RES_TO_USE_TOP_LAYER = 540 // If under 540p, use the topmost video layer, otherwise use layer n-1

/**
 * Peer media reactor
 * - Manages the media stream for a peer
 * @param props
 * @returns
 */
const PeerMedia = (props: { consumerID: string; networkID: InstanceID }) => {
  const immersiveMedia = useMutableState(MediaSettingsState).immersiveMedia.value

  const consumerState = useHookstate(
    getMutableState(MediasoupMediaProducerConsumerState)[props.networkID].consumers[props.consumerID]
  )

  const producerID = consumerState.producerID.value

  const peerID = consumerState.peerID.value
  const mediaTag = consumerState.mediaTag.value

  const type =
    mediaTag === screenshareAudioDataChannelType || mediaTag === screenshareVideoDataChannelType ? 'screen' : 'cam'
  const isAudio = mediaTag === webcamAudioDataChannelType || mediaTag === screenshareAudioDataChannelType

  const peerMediaChannelState = useMutableState(PeerMediaChannelState)[peerID]?.[type]

  const consumer = useHookstate(
    getMutableState(MediasoupMediaProducersConsumersObjectsState).consumers[props.consumerID]
  )?.value as ConsumerExtension

  const producer = useHookstate(getMutableState(MediasoupMediaProducersConsumersObjectsState).producers[producerID])
    ?.value as ProducerExtension

  useEffect(() => {
    if (!consumer) return
    const peerMediaChannelState = getMutableState(PeerMediaChannelState)[peerID]?.[type]
    if (!peerMediaChannelState) return
    if (isAudio) {
      const newMediaStream = new MediaStream([consumer.track.clone()])
      peerMediaChannelState.audioMediaStream.set(newMediaStream)
      return () => {
        newMediaStream.getTracks().forEach((track) => track.stop())
        peerMediaChannelState.audioMediaStream.set(null)
      }
    } else {
      const newMediaStream = new MediaStream([consumer.track.clone()])
      peerMediaChannelState.videoMediaStream.set(newMediaStream)
      return () => {
        newMediaStream.getTracks().forEach((track) => track.stop())
        peerMediaChannelState.videoMediaStream.set(null)
      }
    }
  }, [consumer])

  useEffect(() => {
    const peerMediaChannelState = getMutableState(PeerMediaChannelState)[peerID]?.[type]
    if (!peerMediaChannelState) return
    const paused = !!consumerState.paused.value || !!consumerState.producerPaused.value
    if (isAudio) peerMediaChannelState.audioStreamPaused.set(paused)
    else peerMediaChannelState.videoStreamPaused.set(paused)
  }, [consumerState.paused?.value, consumerState.producerPaused?.value])

  // useEffect(() => {
  //   const globalMute = !!producerState.globalMute?.value
  //   const paused = !!producerState.paused?.value

  //   const peerMediaChannelState = getMutableState(PeerMediaChannelState)[peerID]?.[type]
  //   if (!peerMediaChannelState) return

  //   if (isAudio) {
  //     peerMediaChannelState.audioProducerPaused.set(paused)
  //     peerMediaChannelState.audioProducerGlobalMute.set(globalMute)
  //   } else {
  //     peerMediaChannelState.videoProducerPaused.set(paused)
  //     peerMediaChannelState.videoProducerGlobalMute.set(globalMute)
  //   }
  // }, [producerState.paused?.value])

  const clientSettingQuery = useFind(clientSettingPath)
  const clientSetting = clientSettingQuery.data[0]

  const isPiP = peerMediaChannelState.videoQuality.value === 'largest'

  useEffect(() => {
    if (!consumer || isAudio) return

    const isScreen = mediaTag === screenshareVideoDataChannelType

    const mediaNetwork = NetworkState.mediaNetwork
    const encodings = consumer.rtpParameters.encodings

    const { maxResolution } = clientSetting.mediaSettings.video
    const resolution = VideoConstants.VIDEO_CONSTRAINTS[maxResolution] || VideoConstants.VIDEO_CONSTRAINTS.hd
    if (isPiP || immersiveMedia) {
      let maxLayer
      const scalabilityMode = encodings && encodings[0].scalabilityMode
      if (!scalabilityMode) maxLayer = 0
      else {
        const execed = /L([0-9])/.exec(scalabilityMode)
        if (execed) maxLayer = parseInt(execed[1]) - 1 //Subtract 1 from max scalabilityMode since layers are 0-indexed
        else maxLayer = 0
      }
      // If we're in immersive media mode, using max-resolution video for everyone could overwhelm some devices.
      // If there are more than 2 layers, then use layer n-1 to balance quality and performance
      // (immersive video bubbles are bigger than the flat bubbles, so low-quality video will be more noticeable).
      // If we're not, then the highest layer is still probably more than necessary, so use the n-1 layer unless the
      // n layer is under a specified constant
      MediasoupMediaProducerConsumerState.setPreferredConsumerLayer(
        mediaNetwork,
        consumer.id,
        (immersiveMedia && maxLayer) > 1
          ? maxLayer - 1
          : (!isScreen && resolution.height.ideal) > MAX_RES_TO_USE_TOP_LAYER
          ? maxLayer - 1
          : maxLayer
      )
    }
    // Standard video bubbles in flat/non-immersive mode should use the lowest quality layer for performance reasons
    else MediasoupMediaProducerConsumerState.setPreferredConsumerLayer(mediaNetwork, consumer.id, 0)
  }, [consumer, immersiveMedia, isPiP])

  return null
}

const SelfMedia = () => {
  const mediaStreamState = useMutableState(MediaStreamState)

  const peerMediaChannelState = useMutableState(PeerMediaChannelState)[Engine.instance.store.peerID]

  useEffect(() => {
    const microphoneEnabled = mediaStreamState.microphoneEnabled.value
    peerMediaChannelState.cam.audioMediaStream.set(
      microphoneEnabled ? mediaStreamState.microphoneMediaStream.value : null
    )
  }, [mediaStreamState.microphoneMediaStream.value, mediaStreamState.microphoneEnabled.value])

  useEffect(() => {
    const webcamEnabled = mediaStreamState.webcamEnabled.value
    peerMediaChannelState.cam.videoMediaStream.set(webcamEnabled ? mediaStreamState.webcamMediaStream.value : null)
  }, [mediaStreamState.value.webcamMediaStream, mediaStreamState.webcamEnabled.value])

  useEffect(() => {
    const videoStreamPaused = mediaStreamState.screenshareEnabled.value
    const audioStreamPaused = videoStreamPaused && mediaStreamState.screenShareAudioPaused.value
    peerMediaChannelState.screen.videoMediaStream.set(
      videoStreamPaused ? mediaStreamState.screenshareMediaStream.value : null
    )
    peerMediaChannelState.screen.audioMediaStream.set(
      audioStreamPaused ? mediaStreamState.screenshareMediaStream.value : null
    )
  }, [
    mediaStreamState.screenshareMediaStream.value,
    mediaStreamState.screenshareEnabled.value,
    mediaStreamState.screenShareAudioPaused.value
  ])

  return null
}

const NetworkConsumers = (props: { networkID: InstanceID }) => {
  const { networkID } = props
  const consumers = useHookstate(getMutableState(MediasoupMediaProducerConsumerState)[networkID].consumers)
  return (
    <>
      {consumers.keys.map((consumerID: string) => (
        <PeerMedia key={consumerID} consumerID={consumerID} networkID={networkID} />
      ))}
    </>
  )
}

export const PeerMediaChannel = (props: { peerID: PeerID }) => {
  useEffect(() => {
    createPeerMediaChannels(props.peerID)
    return () => {
      removePeerMediaChannels(props.peerID)
    }
  }, [])
  return null
}

export const PeerMediaChannels = () => {
  const mediaNetwork = useMediaNetwork()

  const mediaPeers = useHookstate([] as PeerID[])

  useEffect(() => {
    const mediaChannelPeers = mediaNetwork?.peers?.keys?.length
      ? Array.from(mediaNetwork.peers.keys as PeerID[]).filter((peerID) => peerID !== mediaNetwork.value.hostPeerID)
      : [Engine.instance.store.peerID]
    mediaPeers.set(mediaChannelPeers)
  }, [mediaNetwork?.peers?.keys?.length])

  return (
    <>
      {mediaPeers.value.map((peerID) => (
        <PeerMediaChannel key={peerID} peerID={peerID} />
      ))}
    </>
  )
}

export const reactor = () => {
  const networkIDs = useMutableState(MediasoupMediaProducerConsumerState)
  const networks = useHookstate(getMutableState(NetworkState).networks)
  const selfPeerMediaChannelState = useHookstate(getMutableState(PeerMediaChannelState)[Engine.instance.store.peerID])
  return (
    <>
      <PeerMediaChannels />
      {selfPeerMediaChannelState.value && <SelfMedia key={'SelfMedia'} />}
      {networkIDs.keys
        .filter((id) => !!networks[id])
        .map((id: InstanceID) => (
          <NetworkConsumers key={id} networkID={id} />
        ))}
    </>
  )
}

export const MediasoupPeerMediaConsumersSystem = defineSystem({
  uuid: 'xrengine.client.MediasoupPeerMediaConsumersSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
