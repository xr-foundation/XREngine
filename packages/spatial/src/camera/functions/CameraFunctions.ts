import { ComponentType, getOptionalComponent, setComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'

import { Box3, PerspectiveCamera, Sphere, Vector3 } from 'three'
import { getBoundingBoxVertices } from '../../transform/functions/BoundingBoxFunctions'
import { TargetCameraRotationComponent } from '../components/TargetCameraRotationComponent'

export const setTargetCameraRotation = (entity: Entity, phi: number, theta: number, time = 0.3) => {
  const cameraRotationTransition = getOptionalComponent(entity, TargetCameraRotationComponent) as
    | ComponentType<typeof TargetCameraRotationComponent>
    | undefined
  if (!cameraRotationTransition) {
    setComponent(entity, TargetCameraRotationComponent, {
      phi: phi,
      phiVelocity: { value: 0 },
      theta: theta,
      thetaVelocity: { value: 0 },
      time: time
    })
  } else {
    cameraRotationTransition.phi = phi
    cameraRotationTransition.theta = theta
    cameraRotationTransition.time = time
  }
}

/**
 * Computes the distance and center of the camera required to fit the points in the camera's view
 * @param camera - PerspectiveCamera
 * @param pointsToFocus - Points to fit in the camera's view
 * @param padding - Padding value to fit the points in the camera's view
 */
export function computeCameraDistanceAndCenter(
  camera: PerspectiveCamera,
  pointsToFocus: Vector3[],
  padding: number = 1.1
) {
  // Create a bounding sphere from the points
  const boundingSphere = new Sphere().setFromPoints(pointsToFocus)

  const center = boundingSphere.center
  const radius = boundingSphere.radius

  // Compute the distance required to fit the sphere in the camera's vertical FOV
  const fov = camera.fov * (Math.PI / 180) // Convert FOV to radians
  // const distance = radius / Math.sin(fov / 2);

  // Calculate the distance needed to fit the object in the camera's view, padding value of 1.1 is a good fit for most cases
  const distance = (radius / 2 / Math.tan(fov / 2)) * padding
  return { distance, center }
}

/**
 * Computes the distance and center of the camera required to fit the box in the camera's view
 * @param camera - PerspectiveCamera
 * @param box - Box3 to fit in the camera's view
 * @param padding - Padding value to fit the box in the camera's view
 */
export function computeCameraDistanceAndCenterFromBox(camera: PerspectiveCamera, box: Box3, padding: number = 1.1) {
  const points = getBoundingBoxVertices(box)
  return computeCameraDistanceAndCenter(camera, points, padding)
}
