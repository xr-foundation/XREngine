
import { Resizable } from 're-resizable'
import React, { useEffect } from 'react'
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa'
import { HiPhone, HiPhoneMissedCall } from 'react-icons/hi'
import { MdScreenShare, MdStopScreenShare, MdVideocam, MdVideocamOff } from 'react-icons/md'

import { useMediaNetwork } from '@xrengine/client-core/src/common/services/MediaInstanceConnectionService'
import { MediaStreamState } from '@xrengine/client-core/src/media/MediaStreamState'
import { ChannelService, ChannelState } from '@xrengine/client-core/src/social/services/ChannelService'
import { useUserAvatarThumbnail } from '@xrengine/client-core/src/user/functions/useUserAvatarThumbnail'
import { useFind, useGet, useMutation } from '@xrengine/common'
import { ChannelID, channelPath, ChannelType, messagePath } from '@xrengine/common/src/schema.type.module'
import { Engine } from '@xrengine/ecs/src/Engine'
import { getMutableState, useHookstate, useMutableState } from '@xrengine/hyperflux'
import { NetworkState } from '@xrengine/network'

import AttachFileIcon from './assets/attach-file2.svg'
import SendIcon from './assets/send.svg'
import UserSvg from './assets/user.svg'
import { ChatState } from './ChatState'
import { MediaCall } from './VideoCall'

/**
 * Create reactor in client-core around messages
 * reacts to chat state changes, both active channel and channel data, and fetches new messages
 */

let height = '75%'

export const getChannelName = (channel: ChannelType) => {
  return (
    channel.name ||
    channel.channelUsers
      .filter((channelUser) => channelUser.user?.id !== Engine.instance.userID)
      .map((channelUser) => channelUser.user?.name)
      .filter(Boolean)
      .join(', ')
  )
}

export const MessageList = (props: { channelID: ChannelID }) => {
  const userThumbnail = useUserAvatarThumbnail(Engine.instance.userID)

  const { data: messages } = useFind(messagePath, {
    query: {
      channelId: props.channelID
    }
  })

  const SelfMessage = (props: { message: (typeof messages)[0] }) => {
    return (
      <>
        <Resizable
          bounds="parent"
          enable={{
            top: false,
            right: false,
            bottom: false,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false
          }}
          minWidth={260}
          maxWidth={780}
        >
          <div className="my-5 flex justify-end gap-1">
            <div className="w-max-[780px] ml-[58px] mr-5 h-full min-w-0 justify-end">
              <p className="rounded-xl border-2 border-[#E1E1E1] bg-[#E1E1E1] p-[3px] text-black">
                {props.message.text}
              </p>
            </div>
            <img className="h-9  w-9 rounded-[38px] object-cover" alt="" src={userThumbnail} />
          </div>
        </Resizable>
      </>
    )
  }

  const OtherMessage = (props: { message: (typeof messages)[0] }) => {
    const userThumbnail = useUserAvatarThumbnail(props.message.sender?.id)
    return (
      <>
        <Resizable
          bounds="parent"
          enable={{
            top: false,
            right: false,
            bottom: false,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false
          }}
          minWidth={260}
          maxWidth={600}
        >
          <div className="flex flex-wrap">
            <img className="h-9 w-9  max-w-full rounded-[38px] object-cover" alt="" src={userThumbnail} />
            <div className="ml-5 h-[20px]">
              <p className="rounded-3xl border-2 border-[#F8F8F8] bg-[#F8F8F8] p-[3px] text-black">
                {props.message.text}
              </p>
            </div>
          </div>
        </Resizable>
      </>
    )
  }

  const MessageField = () => {
    const mutateMessage = useMutation(messagePath)

    const composingMessage = useHookstate('')

    const sendMessage = () => {
      mutateMessage.create({
        text: composingMessage.value,
        channelId: props.channelID
      })
      composingMessage.set('')
    }

    return (
      <div className="relative bottom-0 flex h-[70px]  w-full flex-wrap justify-center gap-5 bg-[#ffffff]">
        <button className="">
          <img className="h-[30px] w-[30px] overflow-hidden rounded-full font-bold" alt="" src={AttachFileIcon} />
        </button>
        <div className="mt-3 flex h-[45px] w-[80%] flex-wrap rounded-3xl bg-[#d7d7d7]">
          <div className="my-2 ml-4 h-[30px] w-[30px] justify-between rounded-full bg-white">
            <img className="mx-2 h-[28.64px] w-[13.64px] max-w-full overflow-hidden" alt="" src={UserSvg} />
          </div>
          <div className="ml-1 mt-[2.5px] h-[30px] w-[525px]">
            <input
              type="text"
              className="m-0 w-full rounded-3xl border-2 border-[#d7d7d7] bg-[#d7d7d7] p-2 text-black focus:border-[#d7d7d7] focus:outline-none "
              value={composingMessage.value}
              onChange={(e) => composingMessage.set(e.target.value)}
            />
          </div>
        </div>
        <button className="" onClick={sendMessage}>
          <img className="h-[30px] w-[30px]" alt="" src={SendIcon} />
        </button>
      </div>
    )
  }

  return (
    <>
      <div
        className="hide-scroll ml-8 mt-4  w-full content-center justify-center overflow-scroll bg-[#FFFFFF]"
        style={{ height: height }}
      >
        {messages.map((message, index) => {
          if (message.sender?.id === Engine.instance.userID) return <SelfMessage key={index} message={message} />
          else return <OtherMessage key={index} message={message} />
        })}
      </div>
      <MessageField />
    </>
  )
}

const MessageHeader = (props: { selectedChannelID: ChannelID }) => {
  const { selectedChannelID } = props

  const targetChannelId = useHookstate(getMutableState(ChannelState).targetChannelId).value
  const { data: channel } = useGet(channelPath, selectedChannelID!)

  const channelName = channel ? getChannelName(channel) : ''
  console.log(selectedChannelID, channel, channelName)

  const mediaStreamState = useMutableState(MediaStreamState)
  const isCamVideoEnabled = !!mediaStreamState.webcamMediaStream.value && mediaStreamState.webcamEnabled.value
  const isCamAudioEnabled = !!mediaStreamState.microphoneMediaStream.value && mediaStreamState.microphoneEnabled.value
  const isScreenVideoEnabled =
    !!mediaStreamState.screenshareMediaStream.value && mediaStreamState.screenshareEnabled.value

  const startMediaCall = () => {
    if (!selectedChannelID) return
    const inChannelCall = targetChannelId === selectedChannelID
    ChannelService.joinChannelInstance(inChannelCall ? ('' as ChannelID) : selectedChannelID)
  }

  useEffect(() => {
    ChannelService.getChannels()
  }, [])

  const mediaNetworkState = useMediaNetwork()
  const mediaNetworkID = NetworkState.mediaNetwork?.id
  const mediaConnected = mediaNetworkID && mediaNetworkState?.ready.value
  const connecting = mediaNetworkID && !mediaNetworkState?.ready?.value

  return (
    <>
      <div className="ml-8">
        <p className="min-w-0 max-w-xs text-2xl font-bold text-[#3F3960]">{channelName}</p>
      </div>
      <div className="mr-5 flex justify-end gap-6">
        {connecting && <p className="mt-6 flex flex-wrap pt-2 text-[#3F3960]">Connecting...</p>}
        {mediaConnected && (
          <>
            <button
              className="m-0 flex h-[38px] w-[38px] flex-wrap justify-center rounded-[5px] bg-[#EDEEF0]"
              onClick={MediaStreamState.toggleWebcamPaused}
            >
              {isCamVideoEnabled ? (
                <MdVideocam className="mt-2 h-5 w-5 overflow-hidden fill-[#ff1515]" />
              ) : (
                <MdVideocamOff className="mt-2 h-5 w-5 overflow-hidden fill-[#3F3960]" />
              )}
            </button>
            <button
              className="m-0 flex h-[38px] w-[38px] flex-wrap justify-center rounded-[5px] bg-[#EDEEF0]"
              onClick={MediaStreamState.toggleMicrophonePaused}
            >
              {isCamAudioEnabled ? (
                <FaMicrophone className="mt-2 h-5 w-5 overflow-hidden fill-[#ff1515]" />
              ) : (
                <FaMicrophoneSlash className="mt-2 h-5 w-5 overflow-hidden fill-[#3F3960]" />
              )}
            </button>
            <button
              className="m-0 flex h-[38px] w-[38px] flex-wrap justify-center rounded-[5px] bg-[#EDEEF0]"
              onClick={MediaStreamState.toggleScreenshare}
            >
              {isScreenVideoEnabled ? (
                <MdScreenShare className="mt-2 h-6 w-6 overflow-hidden fill-[#ff1515]" />
              ) : (
                <MdStopScreenShare className="mt-2 h-6 w-6 overflow-hidden fill-[#3F3960]" />
              )}
            </button>
          </>
        )}
        <button
          className="m-0 flex h-[38px] w-[38px] flex-wrap justify-center rounded-[5px] bg-[#EDEEF0]"
          onClick={() => {
            startMediaCall()
          }}
        >
          {targetChannelId && targetChannelId === selectedChannelID ? (
            <HiPhoneMissedCall
              className="mt-2 h-5 w-5 overflow-hidden fill-[#3F3960]"
              onClick={() => {
                height = '75%'
              }}
            />
          ) : (
            <HiPhone
              className="mt-2 h-5 w-5 overflow-hidden fill-[#3F3960]"
              onClick={() => {
                height = '54%'
              }}
            />
          )}
        </button>
      </div>
    </>
  )
}

export const MessageContainer = () => {
  const selectedChannelID = useHookstate(getMutableState(ChatState).selectedChannelID).value

  const mediaNetworkState = useMediaNetwork()
  const mediaNetworkID = NetworkState.mediaNetwork?.id
  const mediaConnected = mediaNetworkID && mediaNetworkState?.ready.value

  return (
    <>
      <Resizable
        bounds="window"
        defaultSize={{ width: 780, height: '100%' }}
        enable={{
          top: false,
          right: true,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false
        }}
        minWidth={560}
        maxWidth={830}
      >
        <div className=" h-[100vh] bg-white">
          <div className="flex h-[90px] w-full flex-col flex-wrap justify-center">
            {selectedChannelID && <MessageHeader selectedChannelID={selectedChannelID!} />}
          </div>
          <Resizable
            bounds="parent"
            defaultSize={{ width: '100%', height: '100%' }}
            enable={{
              top: false,
              right: false,
              bottom: true,
              left: false,
              topRight: false,
              bottomRight: false,
              bottomLeft: false,
              topLeft: false
            }}
            maxHeight={'100%'}
          >
            {mediaConnected && (
              <>
                <div className="hide-scroll w-full content-center justify-center overflow-x-scroll">
                  <MediaCall />
                </div>
              </>
            )}
            <div className="box-border w-full border-t-[1px] border-solid border-[#D1D3D7]" />
            {selectedChannelID && <MessageList channelID={selectedChannelID} />}
          </Resizable>
        </div>
      </Resizable>
    </>
  )
}
