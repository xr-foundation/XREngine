import React, { useLayoutEffect } from 'react'
import { Quaternion, Vector3 } from 'three'

import { EntityUUID, setComponent, UUIDComponent } from '@xrengine/ecs'
import { defineState, getMutableState, useHookstate, useMutableState } from '@xrengine/hyperflux'

import { TransformComponent } from './components/TransformComponent'
import { SpawnObjectActions } from './SpawnObjectActions'

export const SpawnPoseState = defineState({
  name: 'xrengine.SpawnPoseState',

  initial: {} as Record<
    EntityUUID,
    {
      spawnPosition: Vector3
      spawnRotation: Quaternion
    }
  >,

  receptors: {
    onSpawnObject: SpawnObjectActions.spawnObject.receive((action) => {
      getMutableState(SpawnPoseState)[action.entityUUID].merge({
        spawnPosition: action.position ? new Vector3().copy(action.position) : new Vector3(),
        spawnRotation: action.rotation ? new Quaternion().copy(action.rotation) : new Quaternion()
      })
    })
  },

  reactor: () => {
    const state = useMutableState(SpawnPoseState)
    return (
      <>
        {state.keys.map((uuid: EntityUUID) => (
          <EntityNetworkReactor uuid={uuid} key={uuid} />
        ))}
      </>
    )
  }
})

const EntityNetworkReactor = (props: { uuid: EntityUUID }) => {
  const state = useHookstate(getMutableState(SpawnPoseState)[props.uuid])
  const entity = UUIDComponent.useEntityByUUID(props.uuid)

  useLayoutEffect(() => {
    if (!entity) return
    setComponent(entity, TransformComponent, {
      position: state.spawnPosition.value,
      rotation: state.spawnRotation.value
    })
  }, [entity, state.spawnPosition, state.spawnRotation])

  return null
}
