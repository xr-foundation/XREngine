
import { defineState, getMutableState, none, PeerID } from '@xrengine/hyperflux'

export interface PeerMediaStreamInterface {
  videoMediaStream: MediaStream | null
  audioMediaStream: MediaStream | null
  videoQuality: 'smallest' | 'auto' | 'largest'
  videoStreamPaused: boolean
  audioStreamPaused: boolean
  videoElement: HTMLVideoElement
  audioElement: HTMLAudioElement
}

export const PeerMediaChannelState = defineState({
  name: 'PeerMediaChannelState',
  initial: {} as {
    [peerID: PeerID]: {
      cam: PeerMediaStreamInterface
      screen: PeerMediaStreamInterface
    }
  }
})

export const createPeerMediaChannels = (peerID: PeerID) => {
  console.log('createPeerMediaChannels', peerID)
  const state = getMutableState(PeerMediaChannelState)
  state[peerID].set({
    cam: {
      videoMediaStream: null,
      audioMediaStream: null,
      videoStreamPaused: false,
      videoQuality: 'smallest',
      audioStreamPaused: false,
      videoElement: document.createElement('video'),
      audioElement: document.createElement('audio')
    },
    screen: {
      videoMediaStream: null,
      audioMediaStream: null,
      videoQuality: 'auto',
      videoStreamPaused: false,
      audioStreamPaused: false,
      videoElement: document.createElement('video'),
      audioElement: document.createElement('audio')
    }
  })
}

export const removePeerMediaChannels = (peerID: PeerID) => {
  console.log('removePeerMediaChannels', peerID)
  const state = getMutableState(PeerMediaChannelState)
  state[peerID].set(none)
}
