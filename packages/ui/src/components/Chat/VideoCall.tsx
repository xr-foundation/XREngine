import { t } from 'i18next'
import { Resizable } from 're-resizable'
import React, { useEffect, useRef } from 'react'
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa'

import { useMediaWindows } from '@xrengine/client-core/src/components/UserMediaWindows'
import { MediaStreamState } from '@xrengine/client-core/src/media/MediaStreamState'
import { PeerMediaChannelState, PeerMediaStreamInterface } from '@xrengine/client-core/src/media/PeerMediaChannelState'
import { useUserAvatarThumbnail } from '@xrengine/client-core/src/user/functions/useUserAvatarThumbnail'
import { useGet } from '@xrengine/common'
import { UserName, userPath } from '@xrengine/common/src/schema.type.module'
import { Engine } from '@xrengine/ecs/src/Engine'
import { PeerID, State, getMutableState, useHookstate } from '@xrengine/hyperflux'
import {
  NetworkState,
  screenshareAudioDataChannelType,
  screenshareVideoDataChannelType,
  webcamAudioDataChannelType,
  webcamVideoDataChannelType
} from '@xrengine/network'

export const UserMedia = (props: { peerID: PeerID; type: 'cam' | 'screen' }) => {
  const { peerID, type } = props

  const mediaNetwork = NetworkState.mediaNetwork

  const isSelf =
    !mediaNetwork ||
    peerID === Engine.instance.store.peerID ||
    (mediaNetwork?.peers &&
      Object.values(mediaNetwork.peers).find((peer) => peer.userId === Engine.instance.userID)?.peerID === peerID) ||
    peerID === 'self'
  const isScreen = type === 'screen'

  const userID = mediaNetwork.peers[peerID]?.userId

  const user = useGet(userPath, userID)
  const userThumbnail = useUserAvatarThumbnail(userID)

  const getUsername = () => {
    if (isSelf && !isScreen) return t('user:person.you')
    if (isSelf && isScreen) return t('user:person.yourScreen')
    const username = user.data?.name ?? 'A User'
    if (!isSelf && isScreen) return username + "'s Screen"
    return username
  }

  const peerMediaChannelState = useHookstate(
    getMutableState(PeerMediaChannelState)[peerID][type] as State<PeerMediaStreamInterface>
  )
  const { videoMediaStream, audioMediaStream, videoStreamPaused, audioStreamPaused } = peerMediaChannelState.get({
    noproxy: true
  })

  const username = getUsername() as UserName

  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!ref.current || ref.current.srcObject || !videoMediaStream) return

    ref.current.id = `${peerID}_video_xrui`
    ref.current.autoplay = true
    ref.current.muted = true
    ref.current.setAttribute('playsinline', 'true')

    const newVideoTrack = videoMediaStream.getVideoTracks()[0]!.clone()
    ref.current.srcObject = new MediaStream([newVideoTrack])
    ref.current.play()
  }, [ref.current, videoMediaStream])

  const toggleVideo = async (e) => {
    e.stopPropagation()
    const mediaNetwork = NetworkState.mediaNetwork
    if (isSelf && !isScreen) {
      MediaStreamState.toggleWebcamPaused()
    } else if (isSelf && isScreen) {
      MediaStreamState.toggleScreenshareVideoPaused()
    } else {
      mediaNetwork.pauseTrack(
        peerID,
        isScreen ? screenshareVideoDataChannelType : webcamVideoDataChannelType,
        !videoStreamPaused
      )
    }
  }

  const toggleAudio = async (e) => {
    e.stopPropagation()
    const mediaNetwork = NetworkState.mediaNetwork
    if (isSelf && !isScreen) {
      MediaStreamState.toggleMicrophonePaused()
    } else if (isSelf && isScreen) {
      MediaStreamState.toggleScreenshareAudioPaused()
    } else {
      mediaNetwork.pauseTrack(
        peerID,
        isScreen ? screenshareAudioDataChannelType : webcamAudioDataChannelType,
        !audioStreamPaused
      )
    }
  }

  return (
    <Resizable
      key={username}
      bounds="window"
      defaultSize={{ width: 254, height: 160 }}
      enable={{
        top: false,
        right: true,
        bottom: true,
        left: true,
        topRight: false,
        bottomRight: true,
        bottomLeft: true,
        topLeft: false
      }}
      minWidth={200}
      maxWidth={420}
      minHeight={160}
      maxHeight={250}
    >
      <div
        className={`relative flex h-full items-center justify-center rounded-[5px]`}
        style={{ backgroundColor: 'gray' }} // TODO derive color from user thumbnail
      >
        {!videoMediaStream || videoStreamPaused ? (
          <img
            src={userThumbnail}
            alt=""
            crossOrigin="anonymous"
            draggable={false}
            className="h-[40px] w-[40px] max-w-full rounded-full"
            id={peerID + '-thumbnail'}
          />
        ) : (
          <video
            className="h-full w-full"
            ref={ref}
            key={peerID + '-video-container'}
            id={peerID + '-video-container'}
          />
        )}
        <div className="absolute bottom-1 left-1 flex min-w-0  max-w-xs items-center justify-center rounded-[20px] bg-[#B6AFAE] px-1">
          <p className="font-segoe-ui rounded-2xl text-left text-[12px] text-white [text-align-last:center]">
            {username}
          </p>
        </div>
        <button
          className="absolute bottom-1 right-1 m-0 flex h-[20px] w-[20px] items-center justify-center  rounded-full bg-[#EDEEF0] px-1"
          onClick={toggleAudio}
        >
          {audioStreamPaused ? (
            <FaMicrophoneSlash className="h-5 w-5 overflow-hidden  fill-[#3F3960]" />
          ) : (
            <FaMicrophone className="h-3 w-3 overflow-hidden fill-[#008000]" />
          )}
        </button>
      </div>
    </Resizable>
  )
}

export const MediaCall = () => {
  const windows = useMediaWindows()
  return (
    <div className="mx-1 mt-1 flex flex-wrap gap-1">
      {windows.map(({ peerID, type }) => (
        <UserMedia peerID={peerID} type={type} key={peerID} />
      ))}
    </div>
  )
}
