
import { ChannelID } from '@xrengine/common/src/schema.type.module'
import { defineState } from '@xrengine/hyperflux'

export const ChatState = defineState({
  name: 'xrengine.ui.chat.ChatState',
  initial: () => ({
    selectedChannelID: null as ChannelID | null
  })
})
