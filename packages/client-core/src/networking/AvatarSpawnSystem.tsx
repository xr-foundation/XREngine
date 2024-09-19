
import React, { useEffect } from 'react'

import { getSearchParamFromURL } from '@xrengine/common/src/utils/getSearchParamFromURL'
import { spawnLocalAvatarInWorld } from '@xrengine/common/src/world/receiveJoinWorld'
import {
  defineSystem,
  Engine,
  Entity,
  EntityUUID,
  getComponent,
  getOptionalComponent,
  PresentationSystemGroup,
  useOptionalComponent,
  useQuery,
  UUIDComponent
} from '@xrengine/ecs'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import { getRandomSpawnPoint } from '@xrengine/engine/src/avatar/functions/getSpawnPoint'
import { GLTFComponent } from '@xrengine/engine/src/gltf/GLTFComponent'
import { dispatchAction, getMutableState, getState, useHookstate, useMutableState } from '@xrengine/hyperflux'
import { NetworkState, WorldNetworkAction } from '@xrengine/network'
import { SpectateActions } from '@xrengine/spatial/src/camera/systems/SpectateSystem'

import { useFind, useGet, useMutation } from '@xrengine/common'
import { avatarPath, userAvatarPath } from '@xrengine/common/src/schema.type.module'
import { isClient } from '@xrengine/common/src/utils/getEnvironment'
import { AvatarNetworkAction } from '@xrengine/engine/src/avatar/state/AvatarNetworkActions'
import { ErrorComponent } from '@xrengine/engine/src/scene/components/ErrorComponent'
import { SceneSettingsComponent } from '@xrengine/engine/src/scene/components/SceneSettingsComponent'
import { SearchParamState } from '../common/services/RouterService'
import { useLoadedSceneEntity } from '../hooks/useLoadedSceneEntity'
import { LocationState } from '../social/services/LocationService'
import { AuthState } from '../user/services/AuthService'

export const AvatarSpawnReactor = (props: { sceneEntity: Entity }) => {
  if (!isClient) return null
  const { sceneEntity } = props
  const gltfLoaded = GLTFComponent.useSceneLoaded(sceneEntity)
  const searchParams = useMutableState(SearchParamState)

  const spawnAvatar = useHookstate(false)
  const spectateEntity = useHookstate(null as null | EntityUUID)
  const settingsQuery = useQuery([SceneSettingsComponent])

  const avatarsQuery = useFind(avatarPath)

  useEffect(() => {
    const sceneSettingsSpectateEntity = getOptionalComponent(settingsQuery[0], SceneSettingsComponent)?.spectateEntity
    spectateEntity.set(sceneSettingsSpectateEntity ?? (getSearchParamFromURL('spectate') as EntityUUID))
  }, [settingsQuery, searchParams])

  useEffect(() => {
    if (spectateEntity.value === null) return
    dispatchAction(
      SpectateActions.spectateEntity({
        spectatorUserID: Engine.instance.userID,
        spectatingEntity: spectateEntity.value
      })
    )

    return () => {
      dispatchAction(SpectateActions.exitSpectate({ spectatorUserID: Engine.instance.userID }))
    }
  }, [spectateEntity.value])

  useEffect(() => {
    spawnAvatar.set(gltfLoaded && spectateEntity.value === null)
  }, [gltfLoaded, spectateEntity.value])

  useEffect(() => {
    if (!spawnAvatar.value) return

    const rootUUID = getComponent(sceneEntity, UUIDComponent)
    const avatarSpawnPose = getRandomSpawnPoint(Engine.instance.userID)
    const user = getState(AuthState).user

    spawnLocalAvatarInWorld({
      parentUUID: rootUUID,
      avatarSpawnPose,
      avatarURL: user.avatar.modelResource!.url!,
      name: user.name
    })

    return () => {
      const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
      if (!selfAvatarEntity) return

      const network = NetworkState.worldNetwork

      const peersCountForUser = network?.users?.[Engine.instance.userID]?.length

      // if we are the last peer in the world for this user, destroy the object
      if (!peersCountForUser || peersCountForUser === 1) {
        dispatchAction(WorldNetworkAction.destroyEntity({ entityUUID: getComponent(selfAvatarEntity, UUIDComponent) }))
      }
    }
  }, [spawnAvatar.value])

  const selfAvatarEntity = AvatarComponent.useSelfAvatarEntity()
  const errorWithAvatar = !!useOptionalComponent(selfAvatarEntity, ErrorComponent)

  const userAvatarQuery = useFind(userAvatarPath, { query: { userId: Engine.instance.userID } })
  const userAvatarMutation = useMutation(userAvatarPath)

  const userAvatar = useGet(avatarPath, userAvatarQuery.data[0]?.id)

  useEffect(() => {
    if (!errorWithAvatar || !avatarsQuery.data.length) return
    const randomAvatar = avatarsQuery.data[Math.floor(Math.random() * avatarsQuery.data.length)]
    userAvatarMutation.patch(null, { avatarId: randomAvatar.id }, { query: { userId: Engine.instance.store.userID } })
  }, [errorWithAvatar])

  useEffect(() => {
    if (!userAvatar.data) return
    dispatchAction(
      AvatarNetworkAction.setAvatarURL({
        avatarURL: userAvatar.data.modelResource!.url,
        entityUUID: (Engine.instance.store.userID + '_avatar') as any as EntityUUID
      })
    )
  }, [userAvatar.data])

  return null
}

const reactor = () => {
  const locationSceneID = useHookstate(getMutableState(LocationState).currentLocation.location.sceneId).value
  const sceneEntity = useLoadedSceneEntity(locationSceneID)

  if (!sceneEntity) return null

  return <AvatarSpawnReactor key={sceneEntity} sceneEntity={sceneEntity} />
}

export const AvatarSpawnSystem = defineSystem({
  uuid: 'xrengine.client.AvatarSpawnSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
