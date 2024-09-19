import { act } from '@testing-library/react'
import assert from 'assert'
import React from 'react'
import { createRoot } from 'react-dom/client'

import { ChannelID, MessageID, UserID } from '@xrengine/common/src/schema.type.module'
import { createEngine } from '@xrengine/ecs'
import { getMutableState } from '@xrengine/hyperflux'

import { InstanceChat } from '.'
import { createDOM } from '../../../tests/createDOM'
import { createMockAPI } from '../../../tests/createMockAPI'
import { API } from '../../API'
import { ChannelState } from '../../social/services/ChannelService'

describe('Instance Chat Component', () => {
  let rootContainer: HTMLDivElement

  beforeEach(() => {
    createDOM()
    rootContainer = document.createElement('div')
    document.body.appendChild(rootContainer)
    createEngine()
    API.instance = createMockAPI()
  })

  afterEach(() => {
    document.body.removeChild(rootContainer)
    rootContainer = null!
  })

  it('displays chat message', async () => {
    getMutableState(ChannelState).channels.channels.set([
      {
        id: 'id',
        messages: [
          {
            id: 'message id' as MessageID,
            senderId: 'senderId' as UserID,
            channelId: 'channelId' as ChannelID,
            text: 'message text'
          }
        ]
      } as any
    ])
    act(() => {
      const root = createRoot(rootContainer!)
      root.render(<InstanceChat />)
    })
    const openButton = document.getElementById('openMessagesButton')!
    openButton.addEventListener('click', (e) => console.log(e))
    act(() => {
      openButton.dispatchEvent(new window.CustomEvent('click', { bubbles: true, cancelable: false }))
    })
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const message = rootContainer.querySelector('p')!
    // const message = document.getElementById('message-message id')!
    assert.equal(message.textContent, 'message text')
  })
})
