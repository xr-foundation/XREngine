
import multiLogger from '@xrengine/common/src/logger'
import { defineState, getMutableState, getState, useMutableState } from '@xrengine/hyperflux'
import { VideoConstants } from '@xrengine/network'

import config from '@xrengine/common/src/config'
import { useEffect } from 'react'

const logger = multiLogger.child({ component: 'client-core:MediaStreamState' })

export const MediaStreamState = defineState({
  name: 'MediaStreamState',
  initial: {
    availableVideoDevices: [] as MediaDeviceInfo[],
    availableAudioDevices: [] as MediaDeviceInfo[],
    /** Whether the video is enabled or not. */
    webcamEnabled: false,
    /** Whether the audio is enabled or not. */
    microphoneEnabled: false,
    /** Whether the face tracking is enabled or not. */
    /** @deprecated - face tracking has been disabled */
    faceTracking: false,
    /** Video stream for streaming data. */
    webcamMediaStream: null as MediaStream | null,
    /** Audio stream for streaming data. */
    microphoneMediaStream: null as MediaStream | null,
    /** Audio Gain to be applied on media stream. */
    microphoneGainNode: null as GainNode | null,
    /** Local screen container. */
    screenshareMediaStream: null as MediaStream | null,
    screenshareEnabled: false,
    /** Indication of whether the audio while screen sharing is paused or not. */
    screenShareAudioPaused: false
  },

  toggleMicrophonePaused: () => {
    getMutableState(MediaStreamState).microphoneEnabled.set((val) => !val)
  },

  toggleWebcamPaused: () => {
    getMutableState(MediaStreamState).webcamEnabled.set((val) => !val)
  },

  toggleScreenshare: () => {
    getMutableState(MediaStreamState).screenshareEnabled.set((val) => !val)
  },

  toggleScreenshareAudioPaused: () => {
    getMutableState(MediaStreamState).screenShareAudioPaused.set((val) => !val)
  },

  toggleScreenshareVideoPaused: () => {
    getMutableState(MediaStreamState).screenshareEnabled.set(false)
  },

  reactor: () => {
    const state = useMutableState(MediaStreamState)

    useEffect(() => {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter((device) => device.kind === 'videoinput')
        state.availableVideoDevices.set(videoDevices)
        const audioDevices = devices.filter((device) => device.kind === 'audioinput')
        state.availableAudioDevices.set(audioDevices)
      })
    }, [])

    useEffect(() => {
      if (!state.webcamEnabled.value) return

      const { maxResolution } = config.client.mediaSettings!.video
      const constraints = {
        video: VideoConstants.VIDEO_CONSTRAINTS[maxResolution] || VideoConstants.VIDEO_CONSTRAINTS.hd
      }

      logger.info('Getting video stream %o', constraints)

      const abortController = new AbortController()
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((videoStream) => {
          if (abortController.signal.aborted) {
            videoStream.getVideoTracks().forEach((track) => track.stop())
            return
          }
          state.webcamMediaStream.set(videoStream)
        })
        .catch((err) => {
          logger.error(err)
        })

      return () => {
        abortController.abort()
        const stream = state.webcamMediaStream.value
        if (!stream) return

        stream.getVideoTracks().forEach((track) => track.stop())
        state.webcamMediaStream.set(null)
      }
    }, [state.webcamEnabled.value])

    useEffect(() => {
      if (!state.microphoneEnabled.value) return

      logger.info('Getting audio stream %o', VideoConstants.localAudioConstraints)

      const abortController = new AbortController()
      navigator.mediaDevices
        .getUserMedia(VideoConstants.localAudioConstraints)
        .then((audioStream) => {
          if (abortController.signal.aborted) {
            audioStream.getAudioTracks().forEach((track) => track.stop())
            return
          }
          state.microphoneMediaStream.set(audioStream)
        })
        .catch((err) => {
          logger.error(err)
        })

      return () => {
        abortController.abort()
        const stream = state.microphoneMediaStream.value
        if (!stream) return

        stream.getAudioTracks().forEach((track) => track.stop())
        state.microphoneMediaStream.set(null)
      }
    }, [state.microphoneEnabled.value])

    useEffect(() => {
      if (!state.screenshareEnabled.value) return

      const abortController = new AbortController()

      navigator.mediaDevices
        .getDisplayMedia({
          video: true,
          audio: true
        })
        .then((stream) => {
          if (abortController.signal.aborted) {
            stream.getVideoTracks().forEach((track) => track.stop())
            stream.getAudioTracks().forEach((track) => track.stop())
            return
          }
          state.screenshareMediaStream.set(stream)
        })
        .catch((err) => {
          logger.error(err)
        })

      return () => {
        abortController.abort()
        const stream = state.screenshareMediaStream.value
        if (!stream) return

        stream.getVideoTracks().forEach((track) => track.stop())
        stream.getAudioTracks().forEach((track) => track.stop())
        state.screenshareMediaStream.set(null)
      }
    }, [state.screenshareEnabled.value])
  }
})

export const MediaStreamService = {
  /**
   * Switch to sending video from the "next" camera device in device list (if there are multiple cameras).
   * @returns Whether camera cycled or not.
   */
  async cycleCamera() {
    const state = getMutableState(MediaStreamState)
    if (!state.webcamMediaStream.value) {
      logger.info('Cannot cycle camera - no current camera track')
      return false
    }
    logger.info('Cycle camera')

    // find "next" device in device list
    const deviceId = await MediaStreamService.getCurrentDeviceId('video')
    const allDevices = await navigator.mediaDevices.enumerateDevices()
    const vidDevices = allDevices.filter((d) => d.kind === 'videoinput')
    if (!(vidDevices.length > 1)) {
      logger.info('Cannot cycle camera - only one camera')
      return false
    }

    let tries = 0
    let index = vidDevices.findIndex((d) => d.deviceId === deviceId)

    const cycle = async () => {
      if (index === vidDevices.length - 1) index = 0
      else index += 1

      // get a new video stream. might as well get a new audio stream too,
      // just in case browsers want to group audio/video streams together
      // from the same device when possible (though they don't seem to,
      // currently)
      logger.info(`Getting a video stream from new device "${vidDevices[index].label}".`)

      try {
        const newVideoStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: vidDevices[index].deviceId } }
        })
        state.webcamMediaStream.set(newVideoStream)
      } catch (e) {
        console.error(e)
        tries++
        if (tries >= vidDevices.length - 1) throw new Error('Could not get video stream')
        cycle()
      }
    }

    cycle()
  },

  /** Get device ID of device which is currently streaming media. */
  getCurrentDeviceId(streamType: string) {
    const state = getState(MediaStreamState)
    if (streamType === 'video') {
      if (!state.webcamMediaStream) return null
      const track = state.webcamMediaStream.getVideoTracks()[0]
      if (!track) return null
      const devices = state.availableVideoDevices
      const deviceInfo = devices.find((d) => d.label.startsWith(track.label))!
      return deviceInfo.deviceId
    }
    if (streamType === 'audio') {
      if (!state.microphoneMediaStream) return null
      const track = state.microphoneMediaStream.getAudioTracks()[0]
      if (!track) return null
      const devices = state.availableAudioDevices
      const deviceInfo = devices.find((d) => d.label.startsWith(track.label))!
      return deviceInfo.deviceId
    }
  }
}
