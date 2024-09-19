import {
  NetworkID,
  PeerID,
  UserID,
  Validator,
  defineAction,
  defineState,
  getMutableState,
  getState,
  matches,
  none
} from '@xrengine/hyperflux'

import { DataChannelType } from './DataChannelRegistry'
import { Network } from './Network'
import { SerializationSchema } from './serialization/Utils'

export type PeersUpdateType = {
  peerID: PeerID
  peerIndex: number
  userID: UserID
  userIndex: number
}

export type PeerTransport = {
  message?: (data: any) => void
  buffer?: (dataChannelType: DataChannelType, data: any) => void
  end?: () => void
}

export interface NetworkPeer {
  userId: UserID
  userIndex: number
  peerID: PeerID
  peerIndex: number
  transport?: PeerTransport // todo change this to socket and create a socket transport abstraction
  // The following properties are only present on the server
  lastSeenTs?: any
  /** @deprecated - only used for media recording */
  media?: Record<MediaTagType, PeerMediaType>
}

export class NetworkActions {
  static updatePeers = defineAction({
    type: 'xrengine.engine.network.UPDATE_PEERS',
    peers: matches.array as Validator<unknown, PeersUpdateType[]>
  })
}

export const NetworkState = defineState({
  name: 'NetworkState',
  initial: {
    hostIds: {
      media: null as NetworkID | null,
      world: null as NetworkID | null
    },
    // todo - move to Network.schemas
    networkSchema: {} as { [key: string]: SerializationSchema },
    networks: {} as { [key: NetworkID]: Network },
    config: {
      /** Allow connections to a world instance server */
      world: false,
      /** Allow connections to a media instance server */
      media: false,
      /** Allow connections to channel media instances and friend functionality */
      friends: false,
      /** Use instance IDs in url */
      instanceID: false,
      /** Use room IDs in url */
      roomID: false
    }
  },

  /** must be explicitly ordered as objects return keys in assignment order */
  get orderedNetworkSchema() {
    return Object.keys(getState(NetworkState).networkSchema)
      .sort()
      .map((key) => getState(NetworkState).networkSchema[key])
  },

  get worldNetwork() {
    const state = getState(NetworkState)
    return state.networks[state.hostIds.world!]!
  },

  get worldNetworkState() {
    return getMutableState(NetworkState).networks[getState(NetworkState).hostIds.world!]!
  },

  get mediaNetwork() {
    const state = getState(NetworkState)
    return state.networks[state.hostIds.media!]!
  },

  get mediaNetworkState() {
    return getMutableState(NetworkState).networks[getState(NetworkState).hostIds.media!]!
  }
})

export const webcamVideoDataChannelType = 'xrengine.core.webcamVideo.dataChannel' as DataChannelType
export const webcamAudioDataChannelType = 'xrengine.core.webcamAudio.dataChannel' as DataChannelType
export const screenshareVideoDataChannelType = 'xrengine.core.screenshareVideo.dataChannel' as DataChannelType
export const screenshareAudioDataChannelType = 'xrengine.core.screenshareAudio.dataChannel' as DataChannelType

export type MediaTagType =
  | typeof webcamVideoDataChannelType
  | typeof webcamAudioDataChannelType
  | typeof screenshareVideoDataChannelType
  | typeof screenshareAudioDataChannelType

// export const webcamMediaType = 'webcam'
// export const screenshareMediaType = 'screenshare'

// export type MediaType = typeof webcamMediaType | typeof screenshareMediaType

export type PeerMediaType = {
  /** @deprecated - use ProducersConsumerState instead */
  paused: boolean
  /** @deprecated - use ProducersConsumerState instead */
  globalMute: boolean
  producerId: string
  encodings: Array<{
    mimeType: 'video/rtx' | 'video/vp8' | 'video/h264' | 'video/vp9' | 'audio/opus' | 'audio/pcmu' | 'audio/pcma'
    payloadType: number
    clockRate: number
    parameters: any
    rtcpFeedback: any[]
  }>
}

export const SceneUser = 'scene' as UserID

export const addNetwork = (network: Network) => {
  getMutableState(NetworkState).networks[network.id].set(network)
}

export const removeNetwork = (network: Network) => {
  getMutableState(NetworkState).networks[network.id].set(none)
}
