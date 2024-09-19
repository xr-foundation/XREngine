
import React, { useLayoutEffect } from 'react'

import { EntityUUID, UUIDComponent } from '@xrengine/ecs'
import { setComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { defineState, getMutableState, none, useHookstate, useMutableState } from '@xrengine/hyperflux'
import { WorldNetworkAction } from '@xrengine/network'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'

import { AvatarIKTargetComponent } from '../components/AvatarIKComponents'
import { AvatarNetworkAction } from '../state/AvatarNetworkActions'

export const AvatarIKTargetState = defineState({
  name: 'xrengine.engine.avatar.AvatarIKTargetState',

  initial: {} as Record<
    EntityUUID,
    {
      name: string
    }
  >,

  receptors: {
    onSpawn: AvatarNetworkAction.spawnIKTarget.receive((action) => {
      getMutableState(AvatarIKTargetState)[action.entityUUID].merge({ name: action.name })
    }),
    onDestroyObject: WorldNetworkAction.destroyEntity.receive((action) => {
      getMutableState(AvatarIKTargetState)[action.entityUUID].set(none)
    })
  },

  reactor: () => {
    const avatarIKTargetState = useMutableState(AvatarIKTargetState)
    return (
      <>
        {avatarIKTargetState.keys.map((entityUUID: EntityUUID) => (
          <AvatarReactor key={entityUUID} entityUUID={entityUUID} />
        ))}
      </>
    )
  }
})

const AvatarReactor = ({ entityUUID }: { entityUUID: EntityUUID }) => {
  const state = useHookstate(getMutableState(AvatarIKTargetState)[entityUUID])
  const entity = UUIDComponent.useEntityByUUID(entityUUID)

  useLayoutEffect(() => {
    if (!entity) return
    setComponent(entity, NameComponent, state.name.value)
    setComponent(entity, AvatarIKTargetComponent)
  }, [entity])

  return null
}
