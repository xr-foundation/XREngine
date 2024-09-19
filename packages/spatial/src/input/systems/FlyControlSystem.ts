import { MathUtils, Quaternion, Vector3 } from 'three'

import {
  defineQuery,
  defineSystem,
  ECSState,
  Entity,
  getComponent,
  getOptionalComponent,
  hasComponent,
  InputSystemGroup,
  removeComponent,
  setComponent
} from '@xrengine/ecs'
import { getState } from '@xrengine/hyperflux'

import { CameraComponent } from '../../camera/components/CameraComponent'
import { CameraOrbitComponent } from '../../camera/components/CameraOrbitComponent'
import { FlyControlComponent } from '../../camera/components/FlyControlComponent'
import { Vector3_Up, Vector3_Zero } from '../../common/constants/MathConstants'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { InputComponent } from '../components/InputComponent'
import { InputPointerComponent } from '../components/InputPointerComponent'
import { InputSourceComponent } from '../components/InputSourceComponent'

const EPSILON = 10e-5
const movement = new Vector3()
const direction = new Vector3()
const tempVec3 = new Vector3()
const quat = new Quaternion()
const candidateWorldQuat = new Quaternion()

const center = new Vector3()
const directionToCenter = new Vector3()

const onSecondaryClick = (viewerEntity: Entity) => {
  setComponent(viewerEntity, FlyControlComponent, {
    boostSpeed: 4,
    moveSpeed: 4,
    lookSensitivity: 5,
    maxXRotation: MathUtils.degToRad(80)
  })
}

const onSecondaryReleased = (viewerEntity: Entity) => {
  const transform = getComponent(viewerEntity, TransformComponent)
  const editorCameraCenter = getComponent(viewerEntity, CameraOrbitComponent).cameraOrbitCenter
  center.subVectors(transform.position, editorCameraCenter)
  const centerLength = center.length()
  editorCameraCenter.copy(transform.position)
  editorCameraCenter.add(directionToCenter.set(0, 0, -centerLength).applyQuaternion(transform.rotation))
  removeComponent(viewerEntity, FlyControlComponent)
}

const flyControlQuery = defineQuery([FlyControlComponent, TransformComponent, InputComponent])
const cameraQuery = defineQuery([CameraComponent])
const inputSourceQuery = defineQuery([InputSourceComponent])

const execute = () => {
  const inputSourceEntities = inputSourceQuery()

  /** Since we have nothing that specifies whether we should use orbit/fly controls or not, just tie it to the camera orbit component for the studio */
  for (const entity of cameraQuery()) {
    const inputPointerEntities = InputPointerComponent.getPointersForCamera(entity)
    if (!inputPointerEntities) continue
    if (hasComponent(entity, CameraOrbitComponent)) {
      const buttons = InputComponent.getMergedButtonsForInputSources(inputPointerEntities)
      if (buttons.SecondaryClick?.down) onSecondaryClick(entity)
      if (buttons.SecondaryClick?.up) onSecondaryReleased(entity)
    }
  }

  for (const entity of flyControlQuery()) {
    const buttons = InputComponent.getMergedButtonsForInputSources(inputSourceEntities)

    const flyControlComponent = getComponent(entity, FlyControlComponent)
    const transform = getComponent(entity, TransformComponent)

    movement.copy(Vector3_Zero)
    for (const inputSourceEntity of inputSourceEntities) {
      const inputSource = getComponent(inputSourceEntity, InputSourceComponent)
      const pointer = getOptionalComponent(inputSourceEntity, InputPointerComponent)
      if (pointer && inputSource.buttons.SecondaryClick?.pressed) {
        movement.x += pointer.movement.x
        movement.y += pointer.movement.y
      }
    }

    // rotate about the camera's local x axis
    candidateWorldQuat.multiplyQuaternions(
      quat.setFromAxisAngle(
        tempVec3.set(1, 0, 0).applyQuaternion(transform.rotation),
        movement.y * flyControlComponent.lookSensitivity
      ),
      transform.rotation
    )

    // check change of local "forward" and "up" to disallow flipping
    const camUpY = tempVec3.set(0, 1, 0).applyQuaternion(transform.rotation).y
    const newCamUpY = tempVec3.set(0, 1, 0).applyQuaternion(candidateWorldQuat).y
    const newCamForwardY = tempVec3.set(0, 0, -1).applyQuaternion(candidateWorldQuat).y
    const extrema = Math.sin(flyControlComponent.maxXRotation)
    const allowRotationInX =
      newCamUpY > 0 && ((newCamForwardY < extrema && newCamForwardY > -extrema) || newCamUpY > camUpY)

    if (allowRotationInX) {
      transform.rotation.copy(candidateWorldQuat)
    }

    // rotate about the world y axis
    candidateWorldQuat.multiplyQuaternions(
      quat.setFromAxisAngle(Vector3_Up, -movement.x * flyControlComponent.lookSensitivity),
      transform.rotation
    )

    transform.rotation.copy(candidateWorldQuat)

    const lateralMovement = (buttons.KeyD?.pressed ? 1 : 0) + (buttons.KeyA?.pressed ? -1 : 0)
    const forwardMovement = (buttons.KeyS?.pressed ? 1 : 0) + (buttons.KeyW?.pressed ? -1 : 0)
    const upwardMovement = (buttons.KeyE?.pressed ? 1 : 0) + (buttons.KeyQ?.pressed ? -1 : 0)

    // translate
    direction.set(lateralMovement, 0, forwardMovement)
    direction.applyQuaternion(transform.rotation)
    const boostSpeed = buttons.ShiftLeft?.pressed ? flyControlComponent.boostSpeed : 1
    const deltaSeconds = getState(ECSState).deltaSeconds
    const speed = deltaSeconds * flyControlComponent.moveSpeed * boostSpeed

    if (direction.lengthSq() > EPSILON) transform.position.add(direction.multiplyScalar(speed))

    transform.position.y += upwardMovement * deltaSeconds * flyControlComponent.moveSpeed * boostSpeed
  }
}

export const FlyControlSystem = defineSystem({
  uuid: 'xrengine.engine.FlyControlSystem',
  insert: { with: InputSystemGroup },
  execute
})
