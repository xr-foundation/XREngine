
import { Engine } from '@xrengine/ecs'
import { defineAction, defineState, getMutableState, matches, matchesWithDefault, none } from '@xrengine/hyperflux'
import { NetworkTopics, matchesUserID } from '@xrengine/network'

export class AvatarUIActions {
  static setUserTyping = defineAction({
    type: 'xrengine.client.avatar.USER_IS_TYPING',
    userID: matchesWithDefault(matchesUserID, () => Engine.instance.userID),
    typing: matches.boolean,
    $topic: NetworkTopics.world
  })
}

export const AvatarUIState = defineState({
  name: 'AvatarUIState',

  initial: {
    usersTyping: {} as { [key: string]: true }
  },

  receptors: {
    onSetUserType: AvatarUIActions.setUserTyping.receive((action) => {
      const state = getMutableState(AvatarUIState)
      state.usersTyping[action.userID].set(action.typing ? true : none)
    })
  }
})
