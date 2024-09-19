
import { useEffect } from 'react'

import { LocationService } from '@xrengine/client-core/src/social/services/LocationService'
import multiLogger from '@xrengine/common/src/logger'
import { InstanceID } from '@xrengine/common/src/schema.type.module'
import { Engine, getComponent, UndefinedEntity, UUIDComponent } from '@xrengine/ecs'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import { teleportAvatar } from '@xrengine/engine/src/avatar/functions/moveAvatar'
import { LinkState } from '@xrengine/engine/src/scene/components/LinkComponent'
import { PortalComponent, PortalState } from '@xrengine/engine/src/scene/components/PortalComponent'
import {
  addOutgoingTopicIfNecessary,
  getMutableState,
  getState,
  none,
  useHookstate,
  useMutableState
} from '@xrengine/hyperflux'
import {
  addNetwork,
  createNetwork,
  Network,
  NetworkPeerFunctions,
  NetworkState,
  NetworkTopics,
  removeNetwork
} from '@xrengine/network'
import { loadEngineInjection } from '@xrengine/projects/loadEngineInjection'
import { EngineState } from '@xrengine/spatial/src/EngineState'

import { DomainConfigState } from '@xrengine/engine/src/assets/state/DomainConfigState'
import { RouterState } from '../../common/services/RouterService'
import { LocationState } from '../../social/services/LocationService'
import { AuthState } from '../../user/services/AuthService'

const logger = multiLogger.child({ component: 'client-core:world' })

export const useEngineInjection = () => {
  const loaded = useHookstate(false)
  useEffect(() => {
    loadEngineInjection().then(() => {
      loaded.set(true)
    })
  }, [])
  return loaded.value
}

export const useLinkTeleport = () => {
  const linkState = useMutableState(LinkState)

  useEffect(() => {
    const location = linkState.location.value
    if (!location) return

    logger.info('Relocating to linked location.')

    RouterState.navigate('/location/' + location)
    LocationService.getLocationByName(location)

    // shut down connection with existing world instance server
    // leaving a world instance server will check if we are in a location media instance and shut that down too
    getMutableState(LinkState).location.set(undefined)
  }, [linkState.location])
}

export const usePortalTeleport = () => {
  const engineState = useMutableState(EngineState)
  const locationState = useMutableState(LocationState)
  const portalState = useMutableState(PortalState)

  useEffect(() => {
    const activePortalEntity = portalState.activePortalEntity.value
    if (!activePortalEntity) return

    const activePortal = getComponent(activePortalEntity, PortalComponent)

    const currentLocation = locationState.locationName.value.split('/')[1]
    if (currentLocation === activePortal.location || UUIDComponent.getEntityByUUID(activePortal.linkedPortalId)) {
      teleportAvatar(
        AvatarComponent.getSelfAvatarEntity(),
        activePortal.remoteSpawnPosition,
        true
        // activePortal.remoteSpawnRotation
      )
      portalState.activePortalEntity.set(UndefinedEntity)
      return
    }

    if (activePortal.redirect) {
      window.location.href = getState(DomainConfigState).publicDomain + '/location/' + activePortal.location
      return
    }

    if (activePortal.effectType !== 'None') {
      PortalComponent.setPlayerInPortalEffect(activePortal.effectType)
    } else {
      getMutableState(PortalState).portalReady.set(true)
      // teleport player to where the portal spawn position is
      teleportAvatar(AvatarComponent.getSelfAvatarEntity(), activePortal.remoteSpawnPosition, true)
    }
  }, [portalState.activePortalEntity])

  useEffect(() => {
    if (!portalState.activePortalEntity.value || !portalState.portalReady.value) return

    const activePortalEntity = portalState.activePortalEntity.value
    const activePortal = getComponent(activePortalEntity, PortalComponent)

    RouterState.navigate('/location/' + activePortal.location)
    LocationService.getLocationByName(activePortal.location)

    if (activePortal.effectType === 'None') {
      getMutableState(PortalState).activePortalEntity.set(UndefinedEntity)
    }
  }, [portalState.portalReady])
}

export const useLoadEngineWithScene = () => {
  usePortalTeleport()
  useLinkTeleport()
}

export const useNetwork = (props: { online?: boolean }) => {
  const acceptedTOS = useMutableState(AuthState).user.acceptedTOS.value

  useEffect(() => {
    getMutableState(NetworkState).config.set({
      world: !!props.online,
      media: !!props.online && acceptedTOS,
      friends: !!props.online,
      instanceID: !!props.online,
      roomID: false
    })
  }, [props.online, acceptedTOS])

  /** Offline/local world network */
  useEffect(() => {
    if (props.online) return

    const userID = Engine.instance.userID
    const peerID = Engine.instance.store.peerID
    const userIndex = 1
    const peerIndex = 1

    const networkState = getMutableState(NetworkState)
    networkState.hostIds.world.set(userID as any as InstanceID)
    addNetwork(createNetwork(userID as any as InstanceID, peerID, NetworkTopics.world))
    addOutgoingTopicIfNecessary(NetworkTopics.world)

    NetworkState.worldNetworkState.ready.set(true)

    NetworkPeerFunctions.createPeer(NetworkState.worldNetwork as Network, peerID, peerIndex, userID, userIndex)

    const network = NetworkState.worldNetwork as Network

    return () => {
      removeNetwork(network)
      networkState.hostIds.world.set(none)
    }
  }, [props.online])
}
