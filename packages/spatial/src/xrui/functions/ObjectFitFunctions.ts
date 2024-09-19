import { Matrix4, Quaternion, Vector2, Vector3 } from 'three'

import { getComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Engine } from '@xrengine/ecs/src/Engine'
import { Entity } from '@xrengine/ecs/src/Entity'
import type { WebContainer3D } from '@xrengine/xrui'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'

const _size = new Vector2()
const _vec = new Vector3()
const _pos = new Vector3()
const _quat = new Quaternion()
const _forward = new Vector3(0, 0, -1)
const _mat4 = new Matrix4()
const _vec3 = new Vector3()

export type ContentFitType = 'cover' | 'contain' | 'vertical' | 'horizontal'
export const ContentFitTypeSchema = (init?: ContentFitType) =>
  S.LiteralUnion(['cover', 'contain', 'vertical', 'horizontal'], init ?? 'contain')

// yes, multiple by the same direction twice, as the local coordinate changes with each rotation
const _handRotation = new Quaternion()
  .setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)
  .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI))
  .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2))

export const ObjectFitFunctions = {
  computeContentFitScale: (
    contentWidth: number,
    contentHeight: number,
    containerWidth: number,
    containerHeight: number,
    fit: ContentFitType = 'contain'
  ) => {
    const ratioContent = contentWidth / contentHeight
    const ratioContainer = containerWidth / containerHeight

    const useHeight =
      fit === 'cover'
        ? ratioContent > ratioContainer
        : fit === 'contain'
        ? ratioContent < ratioContainer
        : fit === 'vertical'
        ? true
        : false

    let scale = 1
    if (useHeight) {
      scale = containerHeight / contentHeight
    } else {
      scale = containerWidth / contentWidth
    }

    return scale
  },

  computeFrustumSizeAtDistance: (
    distance: number,
    camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
  ) => {
    // const vFOV = camera.fov * DEG2RAD
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert()
    const inverseProjection = camera.projectionMatrixInverse
    const topRadians = _vec.set(0, 1, -1).applyMatrix4(inverseProjection).angleTo(_forward)
    const bottomRadians = _vec.set(0, -1, -1).applyMatrix4(inverseProjection).angleTo(_forward)
    const vFOV = topRadians + bottomRadians
    const height = Math.tan(vFOV / 2) * Math.abs(distance) * 2
    const width = height * camera.aspect
    return _size.set(width, height)
  },

  computeContentFitScaleForCamera: (
    distance: number,
    contentWidth: number,
    contentHeight: number,
    fit: ContentFitType = 'contain',
    camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
  ) => {
    const size = ObjectFitFunctions.computeFrustumSizeAtDistance(distance, camera)
    return ObjectFitFunctions.computeContentFitScale(contentWidth, contentHeight, size.width, size.height, fit)
  },

  attachObjectInFrontOfCamera: (entity: Entity, scale: number, distance: number) => {
    const transform = getComponent(entity, TransformComponent)
    _mat4.makeTranslation(0, 0, -distance).scale(_vec3.set(scale, scale, 1))
    transform.matrixWorld.multiplyMatrices(
      getComponent(Engine.instance.cameraEntity, CameraComponent).matrixWorld,
      _mat4
    )
    transform.matrixWorld.decompose(transform.position, transform.rotation, transform.scale)
  },

  lookAtCameraFromPosition: (container: WebContainer3D, position: Vector3) => {
    const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
    container.scale.setScalar(Math.max(1, camera.position.distanceTo(position) / 3))
    container.position.copy(position)
    container.rotation.setFromRotationMatrix(camera.matrixWorld)
  }
}
