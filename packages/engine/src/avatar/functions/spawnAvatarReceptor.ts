import { AnimationClip, AnimationMixer, Object3D, Vector3 } from 'three'

import {
  createEntity,
  Engine,
  Entity,
  EntityUUID,
  getComponent,
  getOptionalComponent,
  setComponent,
  UUIDComponent
} from '@xrengine/ecs'
import { NetworkObjectComponent, NetworkObjectSendPeriodicUpdatesTag } from '@xrengine/network'
import { setTargetCameraRotation } from '@xrengine/spatial/src/camera/functions/CameraFunctions'
import { InputComponent } from '@xrengine/spatial/src/input/components/InputComponent'
import { ColliderComponent } from '@xrengine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@xrengine/spatial/src/physics/components/RigidBodyComponent'
import { AvatarCollisionMask, CollisionGroups } from '@xrengine/spatial/src/physics/enums/CollisionGroups'
import { BodyTypes, Shapes } from '@xrengine/spatial/src/physics/types/PhysicsTypes'
import { addObjectToGroup } from '@xrengine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import {
  DistanceFromCameraComponent,
  FrustumCullCameraComponent
} from '@xrengine/spatial/src/transform/components/DistanceComponents'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'

import { CameraComponent } from '../../../../spatial/src/camera/components/CameraComponent'
import { GrabberComponent } from '../../interaction/components/GrabbableComponent'
import { EnvmapComponent } from '../../scene/components/EnvmapComponent'
import { ShadowComponent } from '../../scene/components/ShadowComponent'
import { EnvMapSourceType } from '../../scene/constants/EnvMapEnum'
import { proxifyParentChildRelationships } from '../../scene/functions/loadGLTFModel'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarColliderComponent, AvatarControllerComponent, eyeOffset } from '../components/AvatarControllerComponent'

export const spawnAvatarReceptor = (entityUUID: EntityUUID) => {
  const entity = UUIDComponent.getEntityByUUID(entityUUID)
  if (!entity) return

  const ownerID = getComponent(entity, NetworkObjectComponent).ownerId
  setComponent(entity, TransformComponent)

  const obj3d = new Object3D()
  obj3d.entity = entity
  addObjectToGroup(entity, obj3d)
  proxifyParentChildRelationships(obj3d)

  setComponent(entity, VisibleComponent, true)

  setComponent(entity, DistanceFromCameraComponent)
  setComponent(entity, FrustumCullCameraComponent)

  setComponent(entity, EnvmapComponent, {
    type: EnvMapSourceType.Skybox,
    envMapIntensity: 0.5
  })

  setComponent(entity, AvatarComponent)

  setComponent(entity, AnimationComponent, {
    mixer: new AnimationMixer(new Object3D()),
    animations: [] as AnimationClip[]
  })

  setComponent(entity, AvatarAnimationComponent, {
    rootYRatio: 1,
    locomotion: new Vector3()
  })

  setComponent(entity, RigidBodyComponent, {
    type: BodyTypes.Kinematic,
    allowRolling: false,
    enabledRotations: [false, true, false]
  })

  createAvatarCollider(entity)

  if (ownerID === Engine.instance.userID) {
    createAvatarController(entity)
  }

  setComponent(entity, NetworkObjectSendPeriodicUpdatesTag)

  setComponent(entity, ShadowComponent)
  setComponent(entity, GrabberComponent)
  setComponent(entity, AvatarRigComponent)

  setComponent(entity, InputComponent)
}

export const createAvatarCollider = (entity: Entity) => {
  const colliderEntity = createEntity()
  setComponent(entity, AvatarColliderComponent, { colliderEntity })

  setAvatarColliderTransform(colliderEntity)
  setComponent(colliderEntity, EntityTreeComponent, { parentEntity: entity })
  setComponent(colliderEntity, ColliderComponent, {
    shape: Shapes.Capsule,
    collisionLayer: CollisionGroups.Avatars,
    collisionMask: AvatarCollisionMask
  })
}

const avatarCapsuleOffset = 0.25
export const setAvatarColliderTransform = (entity: Entity) => {
  const avatarCollider = getOptionalComponent(entity, AvatarColliderComponent)
  if (!avatarCollider) {
    return
  }
  const colliderEntity = avatarCollider.colliderEntity
  const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
  const avatarRadius = eyeOffset + camera.near
  const avatarComponent = getComponent(entity, AvatarComponent)
  const halfHeight = avatarComponent.avatarHeight * 0.5

  setComponent(colliderEntity, TransformComponent, {
    position: new Vector3(0, halfHeight + avatarCapsuleOffset, 0),
    scale: new Vector3(avatarRadius, halfHeight - avatarRadius - avatarCapsuleOffset, avatarRadius)
  })
}

export const createAvatarController = (entity: Entity) => {
  const transform = getComponent(entity, TransformComponent)

  const avatarForward = new Vector3(0, 0, 1).applyQuaternion(transform.rotation)
  const cameraForward = new Vector3(0, 0, -1)
  let targetTheta = (cameraForward.angleTo(avatarForward) * 180) / Math.PI
  const orientation = cameraForward.x * avatarForward.z - cameraForward.z * avatarForward.x
  if (orientation > 0) targetTheta = 2 * Math.PI - targetTheta
  setTargetCameraRotation(Engine.instance.cameraEntity, 0, targetTheta, 0.01)

  setComponent(entity, AvatarControllerComponent)
}
