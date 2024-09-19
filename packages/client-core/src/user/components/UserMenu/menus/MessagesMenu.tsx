import React from 'react'
import { useTranslation } from 'react-i18next'

import Menu from '@xrengine/client-core/src/common/components/Menu'
import { useFind, useMutation } from '@xrengine/common'
import { ChannelID, messagePath } from '@xrengine/common/src/schema.type.module'
import { Engine } from '@xrengine/ecs/src/Engine'
import { useHookstate, useMutableState } from '@xrengine/hyperflux'
import Icon from '@xrengine/ui/src/primitives/mui/Icon'

import InputText from '../../../../common/components/InputText'
import { SocialMenus } from '../../../../networking/NetworkInstanceProvisioning'
import { ChannelService, ChannelState } from '../../../../social/services/ChannelService'
import XRIconButton from '../../../../systems/components/XRIconButton'
import { useUserAvatarThumbnail } from '../../../functions/useUserAvatarThumbnail'
import { PopupMenuServices } from '../PopupMenuService'

// This file is a raw css copy of packages/ui/src/components/Chat/Message.tsx
// Once location is migrated to tailwind, this file can use that tailwind code instead

/**
 * @todo
 *
 */

const MessagesMenu = (props: { channelID: ChannelID; name: string }): JSX.Element => {
  const { t } = useTranslation()

  const userThumbnail = useUserAvatarThumbnail(Engine.instance.userID)

  const { data: messages } = useFind(messagePath, {
    query: {
      channelId: props.channelID,
      $sort: {
        createdAt: 1
      }
    }
  })

  const channelState = useMutableState(ChannelState)
  const inChannelCall = channelState.targetChannelId.value === props.channelID

  const startMediaCall = () => {
    ChannelService.joinChannelInstance(inChannelCall ? ('' as ChannelID) : props.channelID)
  }

  const SelfMessage = (props: { message: (typeof messages)[0] }) => {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '24px', marginLeft: 'auto' }}>
        <div style={{ height: '20px', marginLeft: '147px', marginRight: '20px' }}>
          <p
            style={{
              borderRadius: '20px',
              border: '2px solid #E1E1E1',
              color: 'black',
              backgroundColor: '#E1E1E1',
              padding: '3px',
              fontFamily: 'var(--lato)'
            }}
          >
            {props.message.text}
          </p>
        </div>
        <img
          style={{ maxWidth: '100%', borderRadius: '38px', width: '36px', height: '36px', objectFit: 'cover' }}
          alt=""
          src={userThumbnail}
        />
      </div>
    )
  }

  const OtherMessage = (props: { message: (typeof messages)[0] }) => {
    const systemMessage = !props.message.sender

    const userThumbnail = useUserAvatarThumbnail(props.message.sender?.id)
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', marginLeft: systemMessage ? 'auto' : '', marginRight: 'auto' }}>
        {!systemMessage && (
          <img
            style={{ maxWidth: '100%', borderRadius: '38px', width: '36px', height: '36px', objectFit: 'cover' }}
            alt=""
            src={userThumbnail}
          />
        )}
        <div style={{ height: '20px', marginLeft: '20px' }}>
          <p
            style={{
              borderRadius: '20px',
              border: systemMessage ? '' : '2px solid #F8F8F8',
              color: 'black',
              backgroundColor: systemMessage ? '' : '#F8F8F8',
              padding: '3px',
              fontFamily: 'var(--lato)'
            }}
          >
            {props.message.text}
          </p>
        </div>
      </div>
    )
  }

  const MessageField = () => {
    const composingMessage = useHookstate('')

    const mutateMessage = useMutation(messagePath)

    const sendMessage = () => {
      mutateMessage.create({
        text: composingMessage.value,
        channelId: props.channelID
      })
      composingMessage.set('')
    }

    const handleMessageKeyDown = (event) => {
      if (event.key === 'Enter' && event.shiftKey) {
        event.preventDefault()
        const selectionStart = (event.target as HTMLInputElement).selectionStart

        composingMessage.set(
          composingMessage.value.substring(0, selectionStart || 0) +
            '\n' +
            composingMessage.value.substring(selectionStart || 0)
        )
        return
      } else if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        sendMessage()
        return
      }
    }

    return (
      <div style={{ position: 'absolute', bottom: '0px', display: 'flex' }}>
        <InputText
          endIcon={<Icon type="Send" />}
          startIcon={
            <img
              style={{ maxWidth: '100%', borderRadius: '38px', width: '36px', height: '36px', objectFit: 'cover' }}
              alt=""
              src={userThumbnail}
            />
          }
          placeholder={t('user:messages.enterMessage')}
          sx={{ mb: 1, mt: 0 }}
          value={composingMessage.value}
          onChange={(e) => composingMessage.set(e.target.value)}
          onKeyDown={(e) => handleMessageKeyDown(e)}
          onEndIconClick={sendMessage}
        />
        <XRIconButton
          size="large"
          xr-layer="true"
          title={t('user:friends.call')}
          style={{ position: 'absolute', right: '0px' }}
          variant="iconOnly"
          onClick={() => startMediaCall()}
          content={<Icon type={inChannelCall ? 'CallEnd' : 'Call'} />}
        />
      </div>
    )
  }

  return (
    <Menu open maxWidth="xs" sx={{}} title={props.name} onClose={() => PopupMenuServices.showPopupMenu()}>
      <XRIconButton
        size="large"
        xr-layer="true"
        className="iconBlock"
        variant="iconOnly"
        onClick={() => PopupMenuServices.showPopupMenu(SocialMenus.Friends)}
        content={<Icon type="ArrowBack" />}
      />
      <div style={{ height: '600px', maxWidth: '100%', overflowX: 'hidden' }}>
        <div
          style={{
            height: 'auto',
            marginLeft: '6px',
            marginBottom: '100px',
            marginTop: '4px',
            marginRight: '8px',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap'
          }}
        >
          {messages.map((message, index) => {
            if (message.sender?.id === Engine.instance.userID) return <SelfMessage key={index} message={message} />
            else return <OtherMessage key={index} message={message} />
          })}
        </div>
        <MessageField />
      </div>
    </Menu>
  )
}

export default MessagesMenu
