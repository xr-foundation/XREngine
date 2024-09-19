
import React, { useEffect } from 'react'
import { PerspectiveCamera } from 'three'

import {
  AnimationSystemGroup,
  defineQuery,
  defineSystem,
  Engine,
  EntityUUID,
  getComponent,
  getOptionalMutableComponent,
  setComponent,
  UUIDComponent
} from '@xrengine/ecs'
import { defineState, getMutableState, none, useMutableState } from '@xrengine/hyperflux'
import { NetworkObjectOwnedTag, WorldNetworkAction } from '@xrengine/network'

import { EngineState } from '../../EngineState'
import { ComputedTransformComponent } from '../../transform/components/ComputedTransformComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CameraSettingsState } from '../CameraSceneMetadata'
import { CameraActions } from '../CameraState'
import { CameraComponent } from '../components/CameraComponent'
import { FollowCameraComponent } from '../components/FollowCameraComponent'

export const CameraEntityState = defineState({
  name: 'CameraEntityState',
  initial: {} as Record<EntityUUID, true>,

  receptors: {
    onCameraSpawn: CameraActions.spawnCamera.receive((action) => {
      getMutableState(CameraEntityState)[action.entityUUID].set(true)
    }),
    onEntityDestroy: WorldNetworkAction.destroyEntity.receive((action) => {
      getMutableState(CameraEntityState)[action.entityUUID].set(none)
    })
  },

  reactor: () => {
    const state = useMutableState(CameraEntityState)
    return (
      <>
        {state.keys.map((entityUUID: EntityUUID) => (
          <CameraEntity key={entityUUID} entityUUID={entityUUID} />
        ))}
      </>
    )
  }
})

const CameraEntity = (props: { entityUUID: EntityUUID }) => {
  const entity = UUIDComponent.useEntityByUUID(props.entityUUID)

  useEffect(() => {
    if (!entity) return
    setComponent(entity, CameraComponent)
  }, [entity])

  return null
}

const ownedNetworkCamera = defineQuery([CameraComponent, NetworkObjectOwnedTag])

function CameraReactor() {
  const cameraSettings = useMutableState(CameraSettingsState)

  useEffect(() => {
    if (!cameraSettings?.cameraNearClip) return
    const camera = getComponent(Engine.instance.cameraEntity, CameraComponent) as PerspectiveCamera
    if (camera?.isPerspectiveCamera) {
      camera.fov = cameraSettings.fov.value
      camera.near = cameraSettings.cameraNearClip.value
      camera.far = cameraSettings.cameraFarClip.value
      camera.updateProjectionMatrix()
    }
  }, [cameraSettings.fov, cameraSettings.cameraNearClip, cameraSettings.cameraFarClip])

  // TODO: this is messy and not properly reactive; we need a better way to handle camera settings
  useEffect(() => {
    if (!cameraSettings?.fov) return
    const follow = getOptionalMutableComponent(Engine.instance.cameraEntity, FollowCameraComponent)
    if (follow) {
      follow.thirdPersonMinDistance.set(cameraSettings.minCameraDistance.value)
      follow.thirdPersonMaxDistance.set(cameraSettings.maxCameraDistance.value)
      follow.distance.set(cameraSettings.startCameraDistance.value)
    }
  }, [cameraSettings])

  return null
}

const execute = () => {
  // as spectatee: update network camera from local camera
  /** @todo event source this */
  for (const networkCameraEntity of ownedNetworkCamera.enter()) {
    const networkTransform = getComponent(networkCameraEntity, TransformComponent)
    const cameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)
    setComponent(networkCameraEntity, ComputedTransformComponent, {
      referenceEntities: [Engine.instance.viewerEntity],
      computeFunction: () => {
        networkTransform.position.copy(cameraTransform.position)
        networkTransform.rotation.copy(cameraTransform.rotation)
      }
    })
  }
}

const reactor = () => {
  return <CameraReactor />
}

export const CameraSystem = defineSystem({
  uuid: 'xrengine.engine.CameraSystem',
  insert: { with: AnimationSystemGroup },
  execute,
  reactor: () => {
    if (!useMutableState(EngineState).viewerEntity.value) return null
    return <CameraReactor />
  }
})
