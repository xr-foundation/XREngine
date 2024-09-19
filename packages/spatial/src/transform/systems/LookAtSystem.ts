
import { Engine, Entity, UUIDComponent, defineQuery, defineSystem, getComponent } from '@xrengine/ecs'
import { Matrix4, Quaternion, Vector3 } from 'three'
import { LookAtComponent } from '../components/LookAtComponent'
import { TransformComponent } from '../components/TransformComponent'
import { TransformDirtyUpdateSystem } from './TransformSystem'

const facerQuery = defineQuery([LookAtComponent, TransformComponent])
const srcPosition = new Vector3()
const dstPosition = new Vector3()
const direction = new Vector3()
const zero = new Vector3()
const up = new Vector3(0, 1, 0)
const lookMatrix = new Matrix4()
const lookRotation = new Quaternion()

export const LookAtSystem = defineSystem({
  uuid: 'xrengine.spatial.LookAtSystem',
  insert: { before: TransformDirtyUpdateSystem },
  execute: () => {
    const viewerEntity = Engine.instance.viewerEntity
    if (!viewerEntity) return

    for (const entity of facerQuery()) {
      const facer = getComponent(entity, LookAtComponent)
      const targetEntity: Entity | null = facer.target ? UUIDComponent.getEntityByUUID(facer.target) : viewerEntity
      if (!targetEntity) continue
      TransformComponent.getWorldPosition(entity, srcPosition)
      TransformComponent.getWorldPosition(targetEntity, dstPosition)
      direction.subVectors(dstPosition, srcPosition).normalize()
      // look at target about enabled axes
      if (!facer.xAxis) {
        direction.y = 0
      }
      if (!facer.yAxis) {
        direction.x = 0
      }
      lookMatrix.lookAt(zero, direction, up)
      lookRotation.setFromRotationMatrix(lookMatrix)
      TransformComponent.setWorldRotation(entity, lookRotation)
      TransformComponent.updateFromWorldMatrix(entity)
    }
  }
})
