
import { AuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { spawnLocalAvatarInWorld } from '@xrengine/common/src/world/receiveJoinWorld'
import { UUIDComponent } from '@xrengine/ecs'
import { getComponent, removeComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Engine } from '@xrengine/ecs/src/Engine'
import { removeEntity } from '@xrengine/ecs/src/EntityFunctions'
import { TransformGizmoControlledComponent } from '@xrengine/editor/src/classes/TransformGizmoControlledComponent'
import { EditorState } from '@xrengine/editor/src/services/EditorServices'
import { transformGizmoControlledQuery } from '@xrengine/editor/src/systems/GizmoSystem'
import { VisualScriptActions, visualScriptQuery } from '@xrengine/engine'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import { getRandomSpawnPoint } from '@xrengine/engine/src/avatar/functions/getSpawnPoint'
import { dispatchAction, getMutableState, getState, useHookstate } from '@xrengine/hyperflux'
import { WorldNetworkAction } from '@xrengine/network'
import { EngineState } from '@xrengine/spatial/src/EngineState'
import { FollowCameraComponent } from '@xrengine/spatial/src/camera/components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '@xrengine/spatial/src/camera/components/TargetCameraRotationComponent'
import { ComputedTransformComponent } from '@xrengine/spatial/src/transform/components/ComputedTransformComponent'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Tooltip from '@xrengine/ui/src/primitives/tailwind/Tooltip'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlinePause, HiOutlinePlay } from 'react-icons/hi2'

/**
 * Returns true if we stopped play mode, false if we were not in play mode
 */
export const onStopPlayMode = (): boolean => {
  const entity = AvatarComponent.getSelfAvatarEntity()
  if (entity) {
    dispatchAction(WorldNetworkAction.destroyEntity({ entityUUID: getComponent(entity, UUIDComponent) }))
    removeEntity(entity)
    const viewerEntity = getState(EngineState).viewerEntity
    removeComponent(viewerEntity, ComputedTransformComponent)
    removeComponent(viewerEntity, FollowCameraComponent)
    removeComponent(viewerEntity, TargetCameraRotationComponent)
    visualScriptQuery().forEach((entity) => dispatchAction(VisualScriptActions.stop({ entity })))
    // stop all visual script logic
  }
  return !!entity
}

export const onStartPlayMode = () => {
  const authState = getState(AuthState)
  const avatarDetails = authState.user.avatar //.value

  const avatarSpawnPose = getRandomSpawnPoint(Engine.instance.userID)
  const currentScene = getComponent(getState(EditorState).rootEntity, UUIDComponent)

  if (avatarDetails)
    spawnLocalAvatarInWorld({
      parentUUID: currentScene,
      avatarSpawnPose,
      avatarURL: avatarDetails.modelResource!.url!,
      name: authState.user.name //.value
    })

  // todo
  // run all visual script logic
  visualScriptQuery().forEach((entity) => dispatchAction(VisualScriptActions.execute({ entity })))
  transformGizmoControlledQuery().forEach((entity) => removeComponent(entity, TransformGizmoControlledComponent))
  //just remove all gizmo in the scene
}

const PlayModeTool: React.FC = () => {
  const { t } = useTranslation()

  const isEditing = useHookstate(getMutableState(EngineState).isEditing)

  const onTogglePlayMode = () => {
    getMutableState(EngineState).isEditing.set(!isEditing.value)
  }

  useEffect(() => {
    if (isEditing.value) return
    onStartPlayMode()
    return () => {
      onStopPlayMode()
    }
  }, [isEditing])

  return (
    <div id="preview" className="flex items-center">
      <Tooltip
        title={
          isEditing.value ? t('editor:toolbar.command.lbl-playPreview') : t('editor:toolbar.command.lbl-stopPreview')
        }
        content={
          isEditing.value ? t('editor:toolbar.command.info-playPreview') : t('editor:toolbar.command.info-stopPreview')
        }
      >
        <Button
          variant="transparent"
          startIcon={
            isEditing.value ? (
              <HiOutlinePlay className="text-theme-input" />
            ) : (
              <HiOutlinePause className="text-theme-input" />
            )
          }
          className="p-0"
          onClick={onTogglePlayMode}
        />
      </Tooltip>
    </div>
  )
}

export default PlayModeTool
