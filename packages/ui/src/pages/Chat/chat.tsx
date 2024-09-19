
import React, { useEffect } from 'react'

import { ChatSection } from '@xrengine/ui/src/components/Chat/ChatSection'
import { Media } from '@xrengine/ui/src/components/Chat/Media'
import { MessageContainer } from '@xrengine/ui/src/components/Chat/Message'

import './index.css'

import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'

import '@xrengine/engine/src/EngineModule'

import { LocationService } from '@xrengine/client-core/src/social/services/LocationService'
import { clientContextParams } from '@xrengine/client-core/src/util/ClientContextState'
import multiLogger from '@xrengine/common/src/logger'
import { getMutableState } from '@xrengine/hyperflux'
import { NetworkState } from '@xrengine/network'
import { loadEngineInjection } from '@xrengine/projects/loadEngineInjection'

const logger = multiLogger.child({ component: 'ui:chat:chat', modifier: clientContextParams })

export const initializeEngineForChat = async () => {
  await loadEngineInjection()
}

export function ChatPage() {
  AuthService.useAPIListeners()
  LocationService.useLocationBanListeners()

  useEffect(() => {
    initializeEngineForChat()
    getMutableState(NetworkState).config.set({
      world: false,
      media: true,
      friends: true,
      instanceID: true,
      roomID: false
    })
    logger.info({ event_name: 'world_chat_open', event_value: '' })
    return () => logger.info({ event_name: 'world_chat_close', event_value: '' })
  }, [])

  return (
    <div className="container pointer-events-auto mx-auto w-full">
      <div className="pointer flex h-[100vh] w-full bg-[#E3E5E8]">
        <ChatSection />
        <MessageContainer />
        <Media />
      </div>
    </div>
  )
}
