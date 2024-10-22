
import { Matrix4, Mesh, Quaternion, Vector3 } from 'three'

import { getComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'

import { TransformComponent } from '../../transform/components/TransformComponent'

/**
 * Applies an entity's transform component to a base mesh
 * @param {Entity} entity
 * @param {Mesh} mesh
 */

export function applyTransformToMesh(entity: Entity, mesh: Mesh) {
  const transform = getComponent(entity, TransformComponent)
  mesh.updateMatrixWorld(true)
  const position = new Vector3()
    .copy(mesh.position)
    .applyQuaternion(transform.rotation)
    .multiply(transform.scale)
    .add(transform.position)
  const quaternion = new Quaternion().setFromRotationMatrix(
    new Matrix4().multiplyMatrices(
      new Matrix4().makeRotationFromQuaternion(transform.rotation),
      new Matrix4().makeRotationFromQuaternion(mesh.quaternion)
    )
  )
  const scale = new Vector3().copy(mesh.scale).multiply(transform.scale)

  mesh.position.copy(position)
  mesh.quaternion.copy(quaternion)
  mesh.scale.copy(scale)
}
/**
 * Applies an entity's transform component to a child mesh in world position
 * @param {Entity} entity
 * @param {Mesh} mesh
 */

export function applyTransformToMeshWorld(entity: Entity, mesh: Mesh) {
  const transform = getComponent(entity, TransformComponent)
  mesh.updateMatrixWorld(true)
  const [position, quaternion, scale] = getTransform(
    mesh.getWorldPosition(new Vector3()),
    mesh.getWorldQuaternion(new Quaternion()),
    mesh.getWorldScale(new Vector3()),
    transform.position,
    transform.rotation,
    transform.scale
  )
  mesh.position.copy(position)
  mesh.quaternion.copy(quaternion)
  mesh.scale.copy(scale)
}

/**
 * Returns the result of applying a transform to another transform
 * @param {Entity} entity
 * @param {Mesh} mesh
 * @returns {[Vector3, Quaternion, Vector3]}
 */

export function getTransform(posM, queM, scaM, posE, queE, scaE): [Vector3, Quaternion, Vector3] {
  const quaternionM = new Quaternion(queM.x, queM.y, queM.z, queM.w)
  const quaternionE = new Quaternion(queE.x, queE.y, queE.z, queE.w)
  const position = new Vector3().set(posM.x, posM.y, posM.z).applyQuaternion(quaternionE)
  const quaternion = new Quaternion()
  const scale = new Vector3()
  position.x = position.x * scaE.x + posE.x
  position.y = position.y * scaE.y + posE.y
  position.z = position.z * scaE.z + posE.z
  quaternion.setFromRotationMatrix(
    new Matrix4().multiplyMatrices(
      new Matrix4().makeRotationFromQuaternion(quaternionE),
      new Matrix4().makeRotationFromQuaternion(quaternionM)
    )
  )
  scale.x = scaM.x * scaE.x
  scale.y = scaM.y * scaE.y
  scale.z = scaM.z * scaE.z
  return [position, quaternion, scale]
}
