
import { useEffect } from 'react'
import { Vector3 } from 'three'

import { UndefinedEntity, UUIDComponent } from '@xrengine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { dispatchAction, getMutableState, getState, useHookstate, useMutableState } from '@xrengine/hyperflux'
import { TransformComponent } from '@xrengine/spatial'
import { setCallback } from '@xrengine/spatial/src/common/CallbackComponent'
import { ArrowHelperComponent } from '@xrengine/spatial/src/common/debug/ArrowHelperComponent'
import { RendererState } from '@xrengine/spatial/src/renderer/RendererState'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { emoteAnimations, preloadedAnimations } from '../../avatar/animation/Util'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { teleportAvatar } from '../../avatar/functions/moveAvatar'
import { AvatarNetworkAction } from '../../avatar/state/AvatarNetworkActions'
import { InteractableComponent, XRUIVisibilityOverride } from '../../interaction/components/InteractableComponent'
import { MountPointActions, MountPointState } from '../../interaction/functions/MountPointActions'
import { SittingComponent } from './SittingComponent'

export const MountPoint = {
  seat: 'seat' as const
}

export type MountPointTypes = (typeof MountPoint)[keyof typeof MountPoint]

const MountPointTypesSchema = S.LiteralUnion(Object.values(MountPoint), 'seat')

/**
 * @todo refactor this into i18n and configurable
 */
const mountPointInteractMessages = {
  [MountPoint.seat]: 'Press E to Sit'
}

const mountCallbackName = 'mountEntity'

const mountEntity = (avatarEntity: Entity, mountEntity: Entity) => {
  if (avatarEntity === UndefinedEntity) return //No avatar found, likely in edit mode for now
  const mountedEntities = getState(MountPointState)
  if (mountedEntities[getComponent(mountEntity, UUIDComponent)]) return //already sitting, exiting

  const avatarUUID = getComponent(avatarEntity, UUIDComponent)
  const mountPoint = getOptionalComponent(mountEntity, MountPointComponent)
  if (!mountPoint || mountPoint.type !== MountPoint.seat) return
  const mountPointUUID = getComponent(mountEntity, UUIDComponent)

  //check if we're already sitting or if the seat is occupied
  if (getState(MountPointState)[mountPointUUID] || hasComponent(avatarEntity, SittingComponent)) return

  setComponent(avatarEntity, SittingComponent, {
    mountPointEntity: mountEntity!
  })

  AvatarControllerComponent.captureMovement(avatarEntity, mountEntity)
  dispatchAction(
    AvatarNetworkAction.setAnimationState({
      animationAsset: preloadedAnimations.emotes,
      clipName: emoteAnimations.seated,
      loop: true,
      layer: 1,
      entityUUID: avatarUUID
    })
  )
  dispatchAction(
    MountPointActions.mountInteraction({
      mounted: true,
      mountedEntity: getComponent(avatarEntity, UUIDComponent),
      targetMount: getComponent(mountEntity, UUIDComponent)
    })
  )
}

const unmountEntity = (entity: Entity) => {
  if (!hasComponent(entity, SittingComponent)) return

  dispatchAction(
    AvatarNetworkAction.setAnimationState({
      animationAsset: preloadedAnimations.emotes,
      clipName: emoteAnimations.seated,
      needsSkip: true,
      entityUUID: getComponent(entity, UUIDComponent)
    })
  )

  const sittingComponent = getComponent(entity, SittingComponent)

  AvatarControllerComponent.releaseMovement(entity, sittingComponent.mountPointEntity)
  dispatchAction(
    MountPointActions.mountInteraction({
      mounted: false,
      mountedEntity: getComponent(entity, UUIDComponent),
      targetMount: getComponent(sittingComponent.mountPointEntity, UUIDComponent)
    })
  )
  const mountTransform = getComponent(sittingComponent.mountPointEntity, TransformComponent)
  const mountComponent = getComponent(sittingComponent.mountPointEntity, MountPointComponent)
  //we use teleport avatar only when rigidbody is not enabled, otherwise translation is called on rigidbody
  const dismountPoint = new Vector3().copy(mountComponent.dismountOffset).applyMatrix4(mountTransform.matrixWorld)
  teleportAvatar(entity, dismountPoint)
  removeComponent(entity, SittingComponent)
}

export const MountPointComponent = defineComponent({
  name: 'MountPointComponent',
  jsonID: 'XRENGINE_mount_point',

  schema: S.Object({
    type: MountPointTypesSchema,
    dismountOffset: S.Vec3({ x: 0, y: 0, z: 0.75 })
  }),

  mountEntity,
  unmountEntity,
  mountCallbackName,
  mountPointInteractMessages,

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)
    const mountPoint = useComponent(entity, MountPointComponent)
    const mountedEntities = useMutableState(MountPointState)

    useEffect(() => {
      setCallback(entity, mountCallbackName, () => mountEntity(AvatarComponent.getSelfAvatarEntity(), entity))
      // setComponent(entity, BoundingBoxComponent, {
      //   box: new Box3().setFromCenterAndSize(
      //     getComponent(entity, TransformComponent).position,
      //     new Vector3(0.1, 0.1, 0.1)
      //   )
      // })
    }, [])

    useEffect(() => {
      // manually hide interactable's XRUI when mounted through visibleComponent - (as interactable uses opacity to toggle visibility)
      const interactableComponent = getComponent(entity, InteractableComponent)
      if (interactableComponent) {
        interactableComponent.uiVisibilityOverride = mountedEntities[getComponent(entity, UUIDComponent)].value
          ? XRUIVisibilityOverride.off
          : XRUIVisibilityOverride.none
      }
    }, [mountedEntities])

    useEffect(() => {
      if (debugEnabled.value) {
        setComponent(entity, ArrowHelperComponent, { name: 'mount-point-helper' })
      }
      return () => {
        removeComponent(entity, ArrowHelperComponent)
      }
    }, [debugEnabled])

    return null
  }
})
