import { useEffect } from 'react'

import { UserID } from '@xrengine/common/src/schema.type.module'
import { ECSState } from '@xrengine/ecs/src/ECSState'
import { Engine } from '@xrengine/ecs/src/Engine'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { getNearbyUsers } from '@xrengine/engine/src/avatar/functions/getNearbyUsers'
import { defineState, getMutableState, getState } from '@xrengine/hyperflux'
import { NetworkState } from '@xrengine/network'

import { useMediaNetwork } from '../common/services/MediaInstanceConnectionService'

export const FilteredUsersState = defineState({
  name: 'FilteredUsersState',
  initial: () => ({
    nearbyLayerUsers: [] as UserID[]
  })
})

export const FilteredUsersService = {
  updateNearbyLayerUsers: () => {
    if (!NetworkState.worldNetwork) return
    const mediaState = getMutableState(FilteredUsersState)
    const peers = Object.values(NetworkState.worldNetwork.peers)
    const worldUserIds = peers
      .filter((peer) => peer.peerID !== NetworkState.worldNetwork.hostPeerID && peer.userId !== Engine.instance.userID)
      .map((peer) => peer.userId)
    const nearbyUsers = getNearbyUsers(Engine.instance.userID, worldUserIds)
    mediaState.nearbyLayerUsers.set(nearbyUsers)
  }
}

export const updateNearbyAvatars = () => {
  const network = NetworkState.mediaNetwork
  if (!network) return

  FilteredUsersService.updateNearbyLayerUsers()
}

// every 5 seconds
const NEARBY_AVATAR_UPDATE_PERIOD = 5
let accumulator = 0

const execute = () => {
  accumulator += getState(ECSState).deltaSeconds
  if (accumulator > NEARBY_AVATAR_UPDATE_PERIOD) {
    accumulator = 0
    updateNearbyAvatars()
  }
}

const reactor = () => {
  const mediaNetwork = useMediaNetwork()

  useEffect(() => {
    accumulator = NEARBY_AVATAR_UPDATE_PERIOD
  }, [mediaNetwork?.peers])

  return null
}

export const FilteredUsersSystem = defineSystem({
  uuid: 'xrengine.client.FilteredUsersSystem',
  insert: { after: PresentationSystemGroup },
  execute,
  reactor
})
