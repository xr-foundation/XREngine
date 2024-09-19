
import { getComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Engine } from '@xrengine/ecs/src/Engine'
import { getState } from '@xrengine/hyperflux'

import { Vector3_One } from '../common/constants/MathConstants'
import { ReferenceSpace, XRState } from '../xr/XRState'
import { EntityTreeComponent } from './components/EntityTree'
import { TransformComponent } from './components/TransformComponent'
import { computeTransformMatrix } from './systems/TransformSystem'

// TODO: only update the world origin in one place; move logic for moving based on viewer hit into the function above
export const updateWorldOriginFromScenePlacement = () => {
  const xrState = getState(XRState)
  const scenePosition = xrState.scenePosition
  const sceneRotation = xrState.sceneRotation
  const worldScale = XRState.worldScale
  const originTransform = getComponent(Engine.instance.localFloorEntity, TransformComponent)
  originTransform.position.copy(scenePosition)
  originTransform.rotation.copy(sceneRotation)
  const children = getComponent(Engine.instance.originEntity, EntityTreeComponent).children
  for (const child of children) {
    const childTransform = getComponent(child, TransformComponent)
    childTransform.scale.setScalar(worldScale)
  }
  originTransform.matrix.compose(originTransform.position, originTransform.rotation, Vector3_One).invert()
  originTransform.matrixWorld.copy(originTransform.matrix)
  originTransform.matrixWorld.decompose(originTransform.position, originTransform.rotation, originTransform.scale)
  if (ReferenceSpace.localFloor) {
    const xrRigidTransform = new XRRigidTransform(scenePosition, sceneRotation)
    ReferenceSpace.origin = ReferenceSpace.localFloor.getOffsetReferenceSpace(xrRigidTransform)
  }
}

export const updateWorldOrigin = () => {
  if (ReferenceSpace.localFloor) {
    const originTransform = getComponent(Engine.instance.localFloorEntity, TransformComponent)
    const xrRigidTransform = new XRRigidTransform(originTransform.position, originTransform.rotation)
    ReferenceSpace.origin = ReferenceSpace.localFloor.getOffsetReferenceSpace(xrRigidTransform.inverse)
  }
}

export const computeAndUpdateWorldOrigin = () => {
  computeTransformMatrix(Engine.instance.localFloorEntity)
  updateWorldOrigin()
}
