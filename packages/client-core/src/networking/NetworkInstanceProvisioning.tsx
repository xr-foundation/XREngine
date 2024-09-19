import Groups from '@mui/icons-material/Groups'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import {
  LocationInstanceConnectionService,
  LocationInstanceState,
  useWorldInstance,
  useWorldNetwork
} from '@xrengine/client-core/src/common/services/LocationInstanceConnectionService'
import {
  MediaInstanceConnectionService,
  MediaInstanceState,
  useMediaInstance
} from '@xrengine/client-core/src/common/services/MediaInstanceConnectionService'
import useFeatureFlags from '@xrengine/client-core/src/hooks/useFeatureFlags'
import { ChannelService, ChannelState } from '@xrengine/client-core/src/social/services/ChannelService'
import { LocationState } from '@xrengine/client-core/src/social/services/LocationService'
import { FeatureFlags } from '@xrengine/common/src/constants/FeatureFlags'
import { InstanceID, LocationID, RoomCode } from '@xrengine/common/src/schema.type.module'
import { PresentationSystemGroup, defineSystem } from '@xrengine/ecs'
import { getMutableState, getState, none, useHookstate, useMutableState } from '@xrengine/hyperflux'
import { NetworkState } from '@xrengine/network'
import { FriendService } from '../social/services/FriendService'
import { connectToInstance } from '../transports/mediasoup/MediasoupClientFunctions'
import { PopupMenuState } from '../user/components/UserMenu/PopupMenuService'
import FriendsMenu from '../user/components/UserMenu/menus/FriendsMenu'
import MessagesMenu from '../user/components/UserMenu/menus/MessagesMenu'

export const WorldInstanceProvisioning = () => {
  const locationState = useMutableState(LocationState)
  const isUserBanned = locationState.currentLocation.selfUserBanned.value

  const worldNetwork = NetworkState.worldNetwork
  const worldNetworkState = useWorldNetwork()
  const networkConfigState = useHookstate(getMutableState(NetworkState).config)

  ChannelService.useAPIListeners()

  const locationInstances = useHookstate(getMutableState(LocationInstanceState).instances)
  const instance = useWorldInstance()

  // Once we have the location, provision the instance server
  useEffect(() => {
    const currentLocation = locationState.currentLocation.location
    const hasJoined = !!worldNetwork

    if (
      !currentLocation.id?.value ||
      isUserBanned ||
      hasJoined ||
      locationInstances.keys.length ||
      Object.values(locationInstances).find((instance) => instance.locationId.value === currentLocation.id?.value)
    )
      return

    const search = window.location.search
    let instanceId = '' as InstanceID
    let roomCode = '' as RoomCode

    if (search != null) {
      if (networkConfigState.instanceID.value)
        instanceId = new URL(window.location.href).searchParams.get('instanceId') as InstanceID
      if (networkConfigState.roomID.value)
        roomCode = new URL(window.location.href).searchParams.get('roomCode') as RoomCode
    }

    const locationID = currentLocation.id.value as LocationID

    if (!networkConfigState.instanceID.value && networkConfigState.roomID.value) {
      LocationInstanceConnectionService.provisionExistingServerByRoomCode(
        locationID,
        roomCode as RoomCode,
        currentLocation.sceneId.value
      )
    } else {
      LocationInstanceConnectionService.provisionServer(
        locationID,
        instanceId || undefined,
        currentLocation.sceneId.value,
        roomCode || undefined
      )
    }

    return () => {
      const locationInstance = Object.entries(locationInstances.value).find(
        ([id, instance]) => instance.locationId === locationID
      )
      if (locationInstance) {
        const [id] = locationInstance
        locationInstances[id].set(none)
      }
    }
  }, [locationState.currentLocation.location])

  // Populate the URL with the room code and instance id
  useEffect(() => {
    if (!networkConfigState.roomID.value && !networkConfigState.instanceID.value) return

    if (worldNetworkState?.ready?.value) {
      const parsed = new URL(window.location.href)
      const query = parsed.searchParams

      if (networkConfigState.roomID.value) query.set('roomCode', instance!.roomCode.value)

      if (networkConfigState.instanceID.value) query.set('instanceId', worldNetwork.id)

      parsed.search = query.toString()
      if (typeof history.pushState !== 'undefined') {
        window.history.replaceState({}, '', parsed.toString())
      }
    }
  }, [worldNetworkState?.ready, locationInstances.keys.length, networkConfigState])

  /**
   * Request media server for this world server
   * @todo handle party logic
   */
  useEffect(() => {
    if (!worldNetwork?.ready) return

    ChannelService.getInstanceChannel(worldNetwork.id)

    return () => {
      ChannelService.leaveInstanceChannel()
    }
  }, [worldNetwork?.ready])

  return (
    <>
      {locationInstances.keys.map((instanceId: InstanceID) => (
        <WorldInstance key={instanceId} id={instanceId} />
      ))}
    </>
  )
}

export const WorldInstance = ({ id }: { id: InstanceID }) => {
  useEffect(() => {
    const worldInstance = getState(LocationInstanceState).instances[id]
    return connectToInstance(
      id,
      worldInstance.ipAddress,
      worldInstance.port,
      worldInstance.locationId,
      undefined,
      worldInstance.roomCode
    )
  }, [])

  return null
}

export const MediaInstanceProvisioning = () => {
  const channelState = useMutableState(ChannelState)

  const worldNetworkId = NetworkState.worldNetwork?.id
  const worldNetwork = useWorldNetwork()

  MediaInstanceConnectionService.useAPIListeners()
  const mediaInstanceState = useHookstate(getMutableState(MediaInstanceState).instances)
  const instance = useMediaInstance()

  // Once we have the world server, provision the media server
  useEffect(() => {
    if (mediaInstanceState.keys.length) return
    if (!channelState.channels.channels?.value.length) return
    const currentChannel =
      channelState.targetChannelId.value === ''
        ? channelState.channels.channels.value.find((channel) => channel.instanceId === worldNetworkId)?.id
        : channelState.targetChannelId.value
    if (!currentChannel) return

    MediaInstanceConnectionService.provisionServer(currentChannel, true)

    /** @todo support multiple locations & cleanup properly */
    // return () => {
    //   const mediaInstance = Object.entries(mediaInstanceState.value).find(
    //     ([id, instance]) => instance.channelId === currentChannel
    //   )
    //   if (mediaInstance) {
    //     const [id] = mediaInstance
    //     mediaInstanceState[id].set(none)
    //   }
    // }
  }, [
    channelState.channels.channels?.length,
    worldNetwork?.ready,
    mediaInstanceState.keys.length,
    channelState.targetChannelId
  ])

  return (
    <>
      {mediaInstanceState.keys.map((instanceId: InstanceID) => (
        <MediaInstance key={instanceId} id={instanceId} />
      ))}
    </>
  )
}

export const MediaInstance = ({ id }: { id: InstanceID }) => {
  useEffect(() => {
    const mediaInstance = getState(MediaInstanceState).instances[id]
    return connectToInstance(
      id,
      mediaInstance.ipAddress,
      mediaInstance.port,
      undefined,
      mediaInstance.channelId,
      mediaInstance.roomCode
    )
  }, [])

  return null
}

export const SocialMenus = {
  Friends: 'Friends',
  Messages: 'Messages'
}

export const FriendMenus = () => {
  const { t } = useTranslation()

  const [socialsEnabled] = useFeatureFlags([FeatureFlags.Client.Menu.Social])

  useEffect(() => {
    if (!socialsEnabled) return

    const popupMenuState = getMutableState(PopupMenuState)
    popupMenuState.menus.merge({
      [SocialMenus.Friends]: FriendsMenu,
      [SocialMenus.Messages]: MessagesMenu
    })

    popupMenuState.hotbar.merge({
      [SocialMenus.Friends]: { icon: <Groups />, tooltip: t('user:menu.friends') }
    })

    return () => {
      popupMenuState.menus.merge({
        [SocialMenus.Friends]: none,
        [SocialMenus.Messages]: none
      })

      popupMenuState.hotbar.merge({
        [SocialMenus.Friends]: none
      })
    }
  }, [socialsEnabled])

  if (!socialsEnabled) return null

  const UseFriendsListeners = () => {
    FriendService.useAPIListeners()
    return null
  }
  return <UseFriendsListeners />
}

export const reactor = () => {
  const networkConfigState = useHookstate(getMutableState(NetworkState).config)

  return (
    <>
      {networkConfigState.world.value && <WorldInstanceProvisioning />}
      {networkConfigState.media.value && <MediaInstanceProvisioning />}
      {networkConfigState.friends.value && <FriendMenus />}
    </>
  )
}

export const InstanceProvisioningSystem = defineSystem({
  uuid: 'xrengine.client.InstanceProvisioningSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
