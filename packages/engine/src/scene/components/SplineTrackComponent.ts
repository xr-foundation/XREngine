
import { useEffect } from 'react'
import { Euler, Matrix4, Quaternion, Vector3 } from 'three'

import { UUIDComponent } from '@xrengine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  useComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { ECSState } from '@xrengine/ecs/src/ECSState'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { useExecute } from '@xrengine/ecs/src/SystemFunctions'
import { getState } from '@xrengine/hyperflux'
import { PhysicsSystem } from '@xrengine/spatial'
import { EngineState } from '@xrengine/spatial/src/EngineState'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { SplineComponent } from './SplineComponent'

const _euler = new Euler()
const _quat = new Quaternion()

const _point1Vector = new Vector3()

export const SplineTrackComponent = defineComponent({
  name: 'SplineTrackComponent',
  jsonID: 'XRENGINE_spline_track',

  schema: S.Object({
    alpha: S.Number(0), // internal
    splineEntityUUID: S.Nullable(S.EntityUUID()),
    velocity: S.Number(1.0),
    enableRotation: S.Bool(false),
    lockToXZPlane: S.Bool(true),
    loop: S.Bool(true)
  }),

  reactor: function (props) {
    const entity = useEntityContext()
    const component = useComponent(entity, SplineTrackComponent)

    useExecute(
      () => {
        const { isEditor } = getState(EngineState)
        const { deltaSeconds } = getState(ECSState)
        if (isEditor) return
        if (!component.splineEntityUUID.value) return
        const splineTargetEntity = UUIDComponent.getEntityByUUID(component.splineEntityUUID.value)
        if (!splineTargetEntity) return

        const splineComponent = getOptionalComponent(splineTargetEntity, SplineComponent)
        if (!splineComponent) return

        // get local transform for this entity
        const transform = getOptionalComponent(entity, TransformComponent)
        if (!transform) return

        const elements = splineComponent.elements
        if (elements.length < 1) return

        if (Math.floor(component.alpha.value) > elements.length - 1) {
          if (!component.loop.value) {
            //emit an event here?
            return
          }
          component.alpha.set(0)
        }
        component.alpha.set(
          (alpha) => alpha + (deltaSeconds * component.velocity.value) / splineComponent.curve.getLength() // todo cache length to avoid recalculating every frame
        )

        // move along spline
        const alpha = component.alpha.value
        const index = Math.floor(component.alpha.value)
        const nextIndex = index + 1 > elements.length - 1 ? 0 : index + 1

        // prevent a possible loop around hiccup; if no loop then do not permit modulo 0
        if (!component.loop.value && index > nextIndex) return

        const splineTransform = getComponent(splineTargetEntity, TransformComponent)

        // translation
        splineComponent.curve.getPointAt(alpha - index, _point1Vector)
        transform.position.copy(_point1Vector)

        // rotation
        const q1 = elements[index].quaternion
        const q2 = elements[nextIndex].quaternion

        if (component.enableRotation.value) {
          if (component.lockToXZPlane.value) {
            // get X and Y rotation only
            _euler.setFromQuaternion(q1)
            _euler.z = 0

            transform.rotation.setFromEuler(_euler)

            _euler.setFromQuaternion(q2)
            _euler.z = 0

            _quat.setFromEuler(_euler)

            transform.rotation.fastSlerp(_quat, alpha - index)
          } else {
            transform.rotation.copy(q1).fastSlerp(q2, alpha - index)
          }
        }

        /** @todo optimize this */
        transform.matrix.compose(transform.position, transform.rotation, transform.scale)
        // apply spline transform
        transform.matrix.premultiply(splineTransform.matrix)
        transform.matrix.decompose(transform.position, transform.rotation, transform.scale)

        // update local transform for target
        const parentEntity = getComponent(entity, EntityTreeComponent).parentEntity
        if (!parentEntity) return
        const parentTransform = getComponent(parentEntity, TransformComponent)
        transform.matrix
          .premultiply(mat4.copy(parentTransform.matrixWorld).invert())
          .decompose(transform.position, transform.rotation, transform.scale)
      },
      { before: PhysicsSystem }
    )

    useEffect(() => {
      if (!component.splineEntityUUID.value) return
      const splineTargetEntity = UUIDComponent.getEntityByUUID(component.splineEntityUUID.value)
      if (!splineTargetEntity) return
      const splineComponent = getOptionalComponent(splineTargetEntity, SplineComponent)
      if (!splineComponent) return
      splineComponent.curve.closed = component.loop.value
    }, [component.loop])

    return null
  }
})

const mat4 = new Matrix4()
