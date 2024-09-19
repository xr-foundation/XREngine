
import { Not } from 'bitecs'
import { Vector3 } from 'three'

import { defineQuery, defineSystem, getComponent, setComponent, UUIDComponent } from '@xrengine/ecs'
import { getState } from '@xrengine/hyperflux'
import { NetworkObjectAuthorityTag } from '@xrengine/network'
import { SpawnPoseState, TransformComponent } from '@xrengine/spatial'
import {
  RigidBodyComponent,
  RigidBodyFixedTagComponent
} from '@xrengine/spatial/src/physics/components/RigidBodyComponent'
import { XRState } from '@xrengine/spatial/src/xr/XRState'

import { SceneComponent } from '@xrengine/spatial/src/renderer/components/SceneComponents'
import { getAncestorWithComponents } from '@xrengine/spatial/src/transform/components/EntityTree'
import { TransformDirtyUpdateSystem } from '@xrengine/spatial/src/transform/systems/TransformSystem'
import { updateReferenceSpaceFromAvatarMovement } from '../../avatar/functions/moveAvatar'
import { SceneSettingsComponent } from '../components/SceneSettingsComponent'

const heightKillApplicableQuery = defineQuery([
  RigidBodyComponent,
  NetworkObjectAuthorityTag,
  Not(RigidBodyFixedTagComponent)
])

const settingsQuery = defineQuery([SceneSettingsComponent])
const tempVector = new Vector3()

const execute = () => {
  const settingsEntities = settingsQuery()
  const sceneKillHeights = settingsEntities.map((entity) => {
    return [
      getAncestorWithComponents(entity, [SceneComponent]),
      getComponent(entity, SceneSettingsComponent).sceneKillHeight
    ]
  })
  const killableEntities = heightKillApplicableQuery()
  const isCameraAttachedToAvatar = XRState.isCameraAttachedToAvatar

  for (const entity of killableEntities) {
    const sceneEntity = getAncestorWithComponents(entity, [SceneComponent])
    const sceneHeight = sceneKillHeights.find(([scene]) => scene === sceneEntity)?.[1]
    if (typeof sceneHeight !== 'number') continue

    const rigidBodyPosition = getComponent(entity, RigidBodyComponent).position
    if (rigidBodyPosition.y < sceneHeight) {
      const uuid = getComponent(entity, UUIDComponent)
      const spawnState = getState(SpawnPoseState)[uuid]

      // reset entity to it's spawn position
      setComponent(entity, TransformComponent, {
        position: spawnState?.spawnPosition,
        rotation: spawnState?.spawnRotation
      })
      TransformComponent.dirtyTransforms[entity] = true

      if (!isCameraAttachedToAvatar) continue

      //@TODO see if we can implicitly update the reference space when the avatar teleports
      updateReferenceSpaceFromAvatarMovement(
        entity,
        tempVector.subVectors(spawnState?.spawnPosition, rigidBodyPosition)
      )
    }
  }
}

export const SceneKillHeightSystem = defineSystem({
  uuid: 'xrengine.engine.SceneKillHeightSystem',
  insert: { before: TransformDirtyUpdateSystem },
  execute
})
