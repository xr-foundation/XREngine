
import { useEffect } from 'react'

import { UUIDComponent } from '@xrengine/ecs'
import { getComponent, getMutableComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Engine } from '@xrengine/ecs/src/Engine'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { getMutableState, getState, useHookstate } from '@xrengine/hyperflux'
import { SpawnPoseState } from '@xrengine/spatial'
import { FollowCameraMode } from '@xrengine/spatial/src/camera/types/FollowCameraMode'

import { FollowCameraComponent } from '@xrengine/spatial/src/camera/components/FollowCameraComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { PortalComponent, PortalState } from '../components/PortalComponent'

const reactor = () => {
  const activePortalEntityState = useHookstate(getMutableState(PortalState).activePortalEntity)

  useEffect(() => {
    const activePortalEntity = activePortalEntityState.value
    if (!activePortalEntity) return
    const activePortal = getComponent(activePortalEntity, PortalComponent)
    getMutableComponent(Engine.instance.cameraEntity, FollowCameraComponent).mode.set(FollowCameraMode.ShoulderCam)
    const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
    AvatarControllerComponent.captureMovement(selfAvatarEntity, activePortalEntity)

    return () => {
      const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
      getState(SpawnPoseState)[getComponent(selfAvatarEntity, UUIDComponent)].spawnPosition.copy(
        activePortal.remoteSpawnPosition
      )
      AvatarControllerComponent.releaseMovement(selfAvatarEntity, activePortalEntity)
      getMutableState(PortalState).lastPortalTimeout.set(Date.now())
    }
  }, [activePortalEntityState])

  return null
}

export const PortalSystem = defineSystem({
  uuid: 'xrengine.engine.PortalSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
