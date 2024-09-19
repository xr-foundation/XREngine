import { useEffect } from 'react'
import { Vector3 } from 'three'

import {
  defineComponent,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { Engine } from '@xrengine/ecs/src/Engine'
import { Entity, UndefinedEntity } from '@xrengine/ecs/src/Entity'
import { entityExists, removeEntity, useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { getState, useImmediateEffect } from '@xrengine/hyperflux'
import { FollowCameraComponent } from '@xrengine/spatial/src/camera/components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '@xrengine/spatial/src/camera/components/TargetCameraRotationComponent'
import { XRState } from '@xrengine/spatial/src/xr/XRState'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { EngineState } from '@xrengine/spatial/src/EngineState'
import { Physics } from '@xrengine/spatial/src/physics/classes/Physics'
import { CameraComponent } from '../../../../spatial/src/camera/components/CameraComponent'
import { setAvatarColliderTransform } from '../functions/spawnAvatarReceptor'
import { AvatarComponent } from './AvatarComponent'

export const eyeOffset = 0.25

export const AvatarControllerComponent = defineComponent({
  name: 'AvatarControllerComponent',

  schema: S.Object({
    /** The camera entity that should be updated by this controller */
    cameraEntity: S.Entity(),
    movementCaptured: S.Array(S.Entity()),
    isJumping: S.Bool(false),
    isWalking: S.Bool(false),
    isInAir: S.Bool(false),
    /** velocity along the Y axis */
    verticalVelocity: S.Number(0),
    /** Is the gamepad-driven jump active */
    gamepadJumpActive: S.Bool(false),
    /** gamepad-driven input, in the local XZ plane */
    gamepadLocalInput: S.Vec3(),
    /** gamepad-driven movement, in the world XZ plane */
    gamepadWorldMovement: S.Vec3()
  }),

  captureMovement(capturedEntity: Entity, entity: Entity): void {
    const component = getComponent(capturedEntity, AvatarControllerComponent)
    if (component.movementCaptured.indexOf(entity) !== -1) return
    component.movementCaptured.push(entity)
  },

  releaseMovement(capturedEntity: Entity, entity: Entity): void {
    const component = getComponent(capturedEntity, AvatarControllerComponent)
    const index = component.movementCaptured.indexOf(entity)
    if (index !== -1) component.movementCaptured.splice(index, 1)
  },

  reactor: () => {
    const entity = useEntityContext()
    const avatarComponent = useComponent(entity, AvatarComponent)
    const avatarControllerComponent = useComponent(entity, AvatarControllerComponent)
    const isCameraAttachedToAvatar = XRState.useCameraAttachedToAvatar()
    const camera = useComponent(Engine.instance.cameraEntity, CameraComponent)
    const world = Physics.useWorld(entity)

    useImmediateEffect(() => {
      avatarControllerComponent.cameraEntity.set(getState(EngineState).viewerEntity || UndefinedEntity)
    }, [])

    useEffect(() => {
      if (!world) return
      Physics.createCharacterController(world, entity, {})
      world.cameraAttachedRigidbodyEntity = entity
      return () => {
        world.cameraAttachedRigidbodyEntity = UndefinedEntity
        Physics.removeCharacterController(world, entity)
      }
    }, [world])

    useEffect(() => {
      setAvatarColliderTransform(entity)

      const cameraEntity = avatarControllerComponent.cameraEntity.value
      if (cameraEntity && entityExists(cameraEntity) && hasComponent(cameraEntity, FollowCameraComponent)) {
        const cameraComponent = getComponent(cameraEntity, FollowCameraComponent)
        cameraComponent.firstPersonOffset.set(0, avatarComponent.eyeHeight.value, eyeOffset)
        cameraComponent.thirdPersonOffset.set(0, avatarComponent.eyeHeight.value, 0)
      }
    }, [avatarComponent.avatarHeight, camera.near])

    useEffect(() => {
      if (isCameraAttachedToAvatar) {
        const controller = getComponent(entity, AvatarControllerComponent)
        removeComponent(controller.cameraEntity, FollowCameraComponent)
      } else {
        const controller = getComponent(entity, AvatarControllerComponent)
        const targetCameraRotation = getComponent(controller.cameraEntity, TargetCameraRotationComponent)
        setComponent(controller.cameraEntity, FollowCameraComponent, {
          targetEntity: entity,
          phi: targetCameraRotation.phi,
          theta: targetCameraRotation.theta,
          firstPersonOffset: new Vector3(0, avatarComponent.eyeHeight.value, eyeOffset),
          thirdPersonOffset: new Vector3(0, avatarComponent.eyeHeight.value, 0)
        })
      }
    }, [isCameraAttachedToAvatar])

    return null
  }
})

export const AvatarColliderComponent = defineComponent({
  name: 'AvatarColliderComponent',
  schema: S.Object({ colliderEntity: S.Entity() }),

  reactor() {
    const entity = useEntityContext()
    const avatarColliderComponent = getComponent(entity, AvatarColliderComponent)
    useEffect(() => {
      return () => {
        removeEntity(
          avatarColliderComponent.colliderEntity
        ) /** @todo Aidan said to figure out why this isn't cleaned up with EntityTree */
      }
    }, [])
  }
})
