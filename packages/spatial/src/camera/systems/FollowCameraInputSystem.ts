import { Vector2 } from 'three'

import { Entity } from '@xrengine/ecs'
import { getComponent, getMutableComponent, getOptionalComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { ECSState } from '@xrengine/ecs/src/ECSState'
import { defineQuery } from '@xrengine/ecs/src/QueryFunctions'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { InputSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { getState, useMutableState } from '@xrengine/hyperflux'
import { CameraSettings } from '@xrengine/spatial/src/camera/CameraState'
import { FollowCameraComponent } from '@xrengine/spatial/src/camera/components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '@xrengine/spatial/src/camera/components/TargetCameraRotationComponent'
import { setTargetCameraRotation } from '@xrengine/spatial/src/camera/functions/CameraFunctions'
import { FollowCameraMode } from '@xrengine/spatial/src/camera/types/FollowCameraMode'
import { DefaultAxisAlias, InputComponent } from '@xrengine/spatial/src/input/components/InputComponent'
import { InputPointerComponent } from '@xrengine/spatial/src/input/components/InputPointerComponent'
import { InputSourceComponent } from '@xrengine/spatial/src/input/components/InputSourceComponent'
import { getThumbstickOrThumbpadAxes } from '@xrengine/spatial/src/input/functions/getThumbstickOrThumbpadAxes'
import { AxisValueMap } from '@xrengine/spatial/src/input/state/ButtonState'
import { InputState } from '@xrengine/spatial/src/input/state/InputState'
import { XRState } from '@xrengine/spatial/src/xr/XRState'
import { useEffect } from 'react'
import { EngineState } from '../../EngineState'
import { TransformComponent } from '../../SpatialModule'
import { Q_Y_180 } from '../../common/constants/MathConstants'
import { RendererComponent } from '../../renderer/WebGLRendererSystem'

// const throttleHandleCameraZoom = throttle(handleFollowCameraZoom, 30, { leading: true, trailing: false })

const pointerPositionDelta = new Vector2()
const rendererQuery = defineQuery([RendererComponent])
const epsilon = 0.001

const followCameraModeCycle = [
  FollowCameraMode.FirstPerson,
  FollowCameraMode.ShoulderCam,
  FollowCameraMode.ThirdPerson,
  FollowCameraMode.TopDown
] as FollowCameraMode[]

const onFollowCameraModeCycle = (cameraEntity: Entity) => {
  const follow = getMutableComponent(cameraEntity, FollowCameraComponent)
  const mode = follow.mode.value
  const currentModeIdx = followCameraModeCycle.includes(mode) ? followCameraModeCycle.indexOf(mode) : 0
  const nextModeIdx = (currentModeIdx + 1) % followCameraModeCycle.length
  const nextMode = followCameraModeCycle[nextModeIdx]
  follow.mode.set(nextMode)
}

const onFollowCameraFirstPerson = (cameraEntity: Entity) => {
  const followComponent = getMutableComponent(cameraEntity, FollowCameraComponent)
  followComponent.mode.set(FollowCameraMode.FirstPerson)
}

const onFollowCameraShoulderCam = (cameraEntity: Entity) => {
  const follow = getMutableComponent(cameraEntity, FollowCameraComponent)
  follow.mode.set(FollowCameraMode.ShoulderCam)
}

/**
 * Change camera distance.
 * @param cameraEntity Entity holding camera and input component.
 */
export const handleFollowCameraScroll = (
  cameraEntity: Entity,
  axes: AxisValueMap<typeof DefaultAxisAlias>,
  deltaTime: number
): void => {
  const follow = getComponent(cameraEntity, FollowCameraComponent)

  const zoomDelta = axes.FollowCameraZoomScroll ?? 0
  const shoulderDelta = axes.FollowCameraShoulderCamScroll ?? 0

  follow.targetDistance = Math.max(follow.targetDistance + zoomDelta, 0)

  // Math.min(
  //   Math.max(follow.targetDistance + zoomDelta, follow.effectiveMinDistance * 0.8),
  //   follow.effectiveMaxDistance * 1.2
  // )

  const outsideMinMaxRange =
    follow.targetDistance < follow.effectiveMinDistance || follow.targetDistance > follow.effectiveMaxDistance

  if (zoomDelta === 0 && shoulderDelta === 0 && follow.accumulatedZoomTriggerDebounceTime >= 0 && outsideMinMaxRange) {
    follow.accumulatedZoomTriggerDebounceTime += deltaTime
  } else if (Math.abs(zoomDelta) > 0 || Math.abs(shoulderDelta) > 0) {
    if (follow.accumulatedZoomTriggerDebounceTime === -1) {
      follow.lastZoomStartDistance = follow.distance
    }
    follow.accumulatedZoomTriggerDebounceTime = 0
  }
}

const execute = () => {
  if (getState(XRState).xrFrame) return

  const deltaSeconds = getState(ECSState).deltaSeconds
  const cameraSettings = getState(CameraSettings)

  for (const cameraEntity of rendererQuery()) {
    const buttons = InputComponent.getMergedButtons(cameraEntity)
    const axes = InputComponent.getMergedAxes(cameraEntity)

    const inputPointerEntities = InputPointerComponent.getPointersForCamera(cameraEntity)
    const inputState = getState(InputState)

    const follow = getOptionalComponent(cameraEntity, FollowCameraComponent)
    if (!follow) continue

    let { theta, phi } = getOptionalComponent(cameraEntity, TargetCameraRotationComponent) ?? follow
    let time = 0.3

    if (buttons?.PrimaryClick?.pressed && buttons?.PrimaryClick?.dragging) {
      InputState.setCapturingEntity(cameraEntity)
    }
    if (buttons?.FollowCameraModeCycle?.down) onFollowCameraModeCycle(cameraEntity)
    if (buttons?.FollowCameraFirstPerson?.down) onFollowCameraFirstPerson(cameraEntity)
    if (buttons?.FollowCameraShoulderCam?.down) onFollowCameraShoulderCam(cameraEntity)

    const keyDelta = (buttons?.ArrowLeft ? 1 : 0) + (buttons?.ArrowRight ? -1 : 0)
    theta += 100 * deltaSeconds * keyDelta

    for (const inputPointerEid of inputPointerEntities) {
      const inputSource = getComponent(inputPointerEid, InputSourceComponent)
      const [x, y] = getThumbstickOrThumbpadAxes(inputSource.source, inputState.preferredHand)
      theta -= x * 2
      phi += y * 2
      const pointerDragging = inputSource.buttons?.PrimaryClick?.dragging
      if (pointerDragging) {
        const inputPointer = getComponent(inputPointerEid, InputPointerComponent)
        pointerPositionDelta.copy(inputPointer.movement)
        phi -= pointerPositionDelta.y * cameraSettings.cameraRotationSpeed
        theta -= pointerPositionDelta.x * cameraSettings.cameraRotationSpeed
        time = 0.1
      }
    }

    if (getState(InputState).capturingEntity === cameraEntity) {
      setTargetCameraRotation(cameraEntity, phi, theta, time)
    }
    handleFollowCameraScroll(cameraEntity, axes, deltaSeconds)
  }
}

const reactor = () => {
  const xrSession = useMutableState(XRState).session.value

  useEffect(() => {
    if (!xrSession) return

    const { localFloorEntity, viewerEntity } = getState(EngineState)

    /**
     * Upon entering a new XR session, we need to update the world origin to match the local floor.
     */
    const worldOriginTransform = getComponent(localFloorEntity, TransformComponent)
    const cameraAttachedEntity = getOptionalComponent(viewerEntity, FollowCameraComponent)?.targetEntity || viewerEntity
    const transform = getComponent(cameraAttachedEntity, TransformComponent)

    /**
     * Since the world origin is based on gamepad movement, we need to transform it by the pose of Whatever the camera is currently following
     */
    worldOriginTransform.position.copy(transform.position)
    worldOriginTransform.rotation.copy(transform.rotation).multiply(Q_Y_180)
  }, [xrSession])

  return null
}

export const FollowCameraInputSystem = defineSystem({
  uuid: 'xrengine.engine.FollowCameraInputSystem',
  insert: { after: InputSystemGroup },
  execute,
  reactor
})
