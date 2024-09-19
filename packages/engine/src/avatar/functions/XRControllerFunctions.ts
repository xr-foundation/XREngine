
import { AnimationMixer, Group, LoopOnce } from 'three'

import { setComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { createEntity } from '@xrengine/ecs/src/EntityFunctions'
import { getMutableState, getState } from '@xrengine/hyperflux'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { addObjectToGroup, removeObjectFromGroup } from '@xrengine/spatial/src/renderer/components/GroupComponent'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'

import { getGLTFAsync } from '../../assets/functions/resourceLoaderHooks'
import { DomainConfigState } from '../../assets/state/DomainConfigState'
import { SkeletonUtils } from '../SkeletonUtils'
import { AvatarControllerType, AvatarInputSettingsState } from '../state/AvatarInputSettingsState'
import { XRHandMeshModel } from './XRHandMeshModel'

export const initializeControllerModel = async (entity: Entity, handedness: string) => {
  const avatarInputState = getMutableState(AvatarInputSettingsState)
  const avatarInputControllerType = avatarInputState.controlType.value
  if (avatarInputControllerType !== AvatarControllerType.OculusQuest) return

  const [gltf] = await getGLTFAsync(
    `${
      getState(DomainConfigState).cloudDomain
    }/projects/xrengine/default-project/assets/controllers/${handedness}_controller.glb`
  )
  let handMesh = gltf?.scene?.children[0]

  if (!handMesh) {
    console.error(`Could not load mesh`)
    return
  }

  handMesh = SkeletonUtils.clone(handMesh)

  const controller = new Group()
  controller.name = `controller-model-${entity}`
  const controllerEntity = createEntity()
  setComponent(controllerEntity, NameComponent, controller.name)
  setComponent(controllerEntity, EntityTreeComponent, { parentEntity: entity })
  addObjectToGroup(controllerEntity, controller)

  if (controller.userData.mesh) {
    removeObjectFromGroup(controllerEntity, controller.userData.mesh)
  }

  controller.userData.mesh = handMesh
  addObjectToGroup(controllerEntity, controller.userData.mesh)
  controller.userData.handedness = handedness

  const winding = handedness == 'left' ? 1 : -1
  controller.userData.mesh.rotation.x = Math.PI * 0.25
  controller.userData.mesh.rotation.y = Math.PI * 0.5 * winding
  controller.userData.mesh.rotation.z = Math.PI * 0.02 * -winding
}

export const initializeHandModel = async (entity: Entity, handedness: string) => {
  const avatarInputState = getMutableState(AvatarInputSettingsState)
  const avatarInputControllerType = avatarInputState.controlType.value

  // if is hands and 'none' type enabled (instead we use IK to move hands in avatar model)
  if (avatarInputControllerType === AvatarControllerType.None) return

  const [gltf] = await getGLTFAsync(
    `${getState(DomainConfigState).cloudDomain}/projects/xrengine/default-project/assets/controllers/${handedness}.glb`
  )
  const handMesh = gltf?.scene?.children[0]

  const controller = new Group()
  controller.name = `controller-hand-model-${entity}`
  const controllerEntity = createEntity()
  setComponent(controllerEntity, NameComponent, controller.name)
  setComponent(controllerEntity, EntityTreeComponent, { parentEntity: entity })
  addObjectToGroup(controllerEntity, controller)

  if (controller.userData.mesh) {
    removeObjectFromGroup(controllerEntity, controller.userData.mesh)
  }

  controller.userData.mesh = new XRHandMeshModel(entity, controller, handMesh!, handedness)
  addObjectToGroup(controllerEntity, controller.userData.mesh)
  controller.userData.handedness = handedness

  if (gltf?.animations?.length) {
    controller.userData.animations = gltf.animations
  }

  const animations = controller.userData.animations
  const mixer = new AnimationMixer(controller.userData.mesh)
  const fistAction = mixer.clipAction(animations[0])
  fistAction.loop = LoopOnce
  fistAction.clampWhenFinished = true
  controller.userData.mixer = mixer
  controller.userData.actions = [fistAction]
}
