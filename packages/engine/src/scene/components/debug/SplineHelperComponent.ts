
import { useEffect } from 'react'
import { BufferAttribute, BufferGeometry, Line, LineBasicMaterial, MeshBasicMaterial, Vector3 } from 'three'

import {
  createEntity,
  defineComponent,
  removeEntity,
  setComponent,
  useComponent,
  useEntityContext
} from '@xrengine/ecs'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { addObjectToGroup } from '@xrengine/spatial/src/renderer/components/GroupComponent'
import { setVisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayerMasks } from '@xrengine/spatial/src/renderer/constants/ObjectLayers'
import { useResource } from '@xrengine/spatial/src/resources/resourceHooks'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { SplineComponent } from '../SplineComponent'

const ARC_SEGMENTS = 200
const _point = new Vector3()

const lineMaterial = new LineBasicMaterial({ color: 'white', opacity: 0.35 })
const createLineGeom = () => {
  const lineGeometry = new BufferGeometry()
  lineGeometry.setAttribute('position', new BufferAttribute(new Float32Array(ARC_SEGMENTS * 3), 3))
  return lineGeometry
}
const greenMeshMaterial = () => new MeshBasicMaterial({ color: 'lightgreen', opacity: 0.2 })
const redMeshMaterial = () => new MeshBasicMaterial({ color: 'red', opacity: 0.2 })

export const SplineHelperComponent = defineComponent({
  name: 'SplineHelperComponent',
  schema: S.Object({ layerMask: S.Number(ObjectLayerMasks.NodeHelper) }),

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, SplineHelperComponent)
    const spline = useComponent(entity, SplineComponent)

    const [lineGeometry] = useResource(createLineGeom, entity)
    /** @todo these are probably unnecessary and were just used for debugging the implementation */
    // const [sphereGeometry] = useResource(() => new SphereGeometry(0.05, 4, 2), entity)

    // const [greenMat] = useResource(greenMeshMaterial, entity)
    // const [greenSphere] = useDisposable(
    //   Mesh,
    //   entity,
    //   sphereGeometry.value as SphereGeometry,
    //   greenMat.value as MeshBasicMaterial
    // )

    // const [redMat] = useResource(redMeshMaterial, entity)
    // const [redSphere] = useDisposable(
    //   Mesh,
    //   entity,
    //   sphereGeometry.value as SphereGeometry,
    //   redMat.value as MeshBasicMaterial
    // )

    useEffect(() => {
      // const gizmoEntities = [] as Entity[]
      const curve = spline.curve.value
      const elements = spline.elements
      if (elements.length < 3) return
      const lineEntity = createEntity()

      // Geometry and material are created in module scope and reused, do not dispose
      const line = new Line(lineGeometry.value as BufferGeometry, lineMaterial)
      line.name = `SplineHelperComponent-${entity}`

      addObjectToGroup(lineEntity, line)
      setComponent(lineEntity, NameComponent, line.name)
      setComponent(lineEntity, EntityTreeComponent, { parentEntity: entity })

      setVisibleComponent(lineEntity, true)

      // if (elements.length > 0) {
      //   const first = elements[0].value
      //   greenSphere.position.copy(first.position)
      //   addObjectToGroup(lineEntity, greenSphere)
      // }

      // if (elements.length > 1) {
      //   const last = elements[elements.length - 1].value
      //   redSphere.position.copy(last.position)
      //   addObjectToGroup(lineEntity, redSphere)
      // }

      // let id = 0
      // for (const elem of elements.value) {
      //   const gizmoEntity = createEntity()
      //   gizmoEntities.push(gizmoEntity)
      //   setComponent(gizmoEntity, EntityTreeComponent, { parentEntity: lineEntity })
      //   setComponent(gizmoEntity, TransformComponent, {
      //     position: elem.position,
      //     rotation: elem.quaternion
      //   })
      //   setComponent(gizmoEntity, AxesHelperComponent, { name: `spline-gizmo-${++id}` })
      // }

      // setComponent(lineEntity, ObjectLayerMaskComponent, component.layerMask.value)

      const positions = line.geometry.attributes.position
      for (let i = 0; i < ARC_SEGMENTS; i++) {
        const t = i / (ARC_SEGMENTS - 1)
        curve.getPoint(t, _point)
        positions.setXYZ(i, _point.x, _point.y, _point.z)
      }
      positions.needsUpdate = true

      return () => {
        if (lineEntity) removeEntity(lineEntity)
        // for (const gizmoEntity of gizmoEntities) removeEntity(gizmoEntity)
      }
    }, [spline.curve, component.layerMask])

    return null
  }
})
