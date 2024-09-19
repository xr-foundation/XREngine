import { defineState } from '@xrengine/hyperflux'

export const LocalAvatarState = defineState({
  name: 'xrengine.engine.LocalAvatarState',
  initial: {
    avatarReady: false
  }
})
