
import React, { useEffect, useLayoutEffect } from 'react'

import { EntityUUID, getOptionalComponent, setComponent, UUIDComponent } from '@xrengine/ecs'
import { entityExists } from '@xrengine/ecs/src/EntityFunctions'
import { AvatarColliderComponent } from '@xrengine/engine/src/avatar/components/AvatarControllerComponent'
import { loadAvatarModelAsset, unloadAvatarForUser } from '@xrengine/engine/src/avatar/functions/avatarFunctions'
import { spawnAvatarReceptor } from '@xrengine/engine/src/avatar/functions/spawnAvatarReceptor'
import { AvatarNetworkAction } from '@xrengine/engine/src/avatar/state/AvatarNetworkActions'
import { defineState, getMutableState, isClient, none, useHookstate, useMutableState } from '@xrengine/hyperflux'
import { WorldNetworkAction } from '@xrengine/network'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'

export const AvatarState = defineState({
  name: 'xrengine.engine.avatar.AvatarState',

  initial: {} as Record<
    EntityUUID,
    {
      avatarURL: string
      name: string
    }
  >,

  receptors: {
    onSpawn: AvatarNetworkAction.spawn.receive((action) => {
      getMutableState(AvatarState)[action.entityUUID].set({ avatarURL: action.avatarURL, name: action.name })
    }),
    onSetAvatarID: AvatarNetworkAction.setAvatarURL.receive((action) => {
      getMutableState(AvatarState)[action.entityUUID].merge({ avatarURL: action.avatarURL })
    }),
    onSetAvatarName: AvatarNetworkAction.setName.receive((action) => {
      getMutableState(AvatarState)[action.entityUUID].merge({ name: action.name })
    }),
    onDestroyObject: WorldNetworkAction.destroyEntity.receive((action) => {
      getMutableState(AvatarState)[action.entityUUID].set(none)
    })
  },

  reactor: () => {
    const avatarState = useMutableState(AvatarState)
    return (
      <>
        {avatarState.keys.map((entityUUID: EntityUUID) => (
          <AvatarReactor key={entityUUID} entityUUID={entityUUID} />
        ))}
      </>
    )
  }
})

const AvatarReactor = ({ entityUUID }: { entityUUID: EntityUUID }) => {
  const { avatarURL, name } = useHookstate(getMutableState(AvatarState)[entityUUID])
  const entity = UUIDComponent.useEntityByUUID(entityUUID)

  useLayoutEffect(() => {
    if (!entity) return
    spawnAvatarReceptor(entityUUID)
  }, [entity])

  useEffect(() => {
    if (!isClient) return
    if (!entity || !avatarURL.value) return

    loadAvatarModelAsset(entity, avatarURL.value)

    return () => {
      if (!entityExists(entity)) return
      unloadAvatarForUser(entity)
    }
  }, [avatarURL, entity])

  useEffect(() => {
    if (!entity) return
    setComponent(entity, NameComponent, name.value + "'s avatar")
    const colliderEntity = getOptionalComponent(entity, AvatarColliderComponent)?.colliderEntity
    if (colliderEntity) {
      setComponent(colliderEntity, NameComponent, name.value + "'s collider")
    }
  }, [name, entity])

  return null
}
