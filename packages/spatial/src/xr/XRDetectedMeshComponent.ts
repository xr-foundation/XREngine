
import { useEffect } from 'react'
import { BufferAttribute, BufferGeometry, Mesh } from 'three'

import { defineComponent, setComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Engine } from '@xrengine/ecs/src/Engine'
import { Entity } from '@xrengine/ecs/src/Entity'
import { createEntity, useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { getMutableState, getState, useHookstate } from '@xrengine/hyperflux'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { NameComponent } from '../common/NameComponent'
import { addObjectToGroup, removeObjectFromGroup } from '../renderer/components/GroupComponent'
import { setVisibleComponent } from '../renderer/components/VisibleComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { occlusionMat, placementHelperMaterial, shadowMaterial } from './XRDetectedPlaneComponent'
import { ReferenceSpace, XRState } from './XRState'

export const XRDetectedMeshComponent = defineComponent({
  name: 'XRDetectedMeshComponent',

  schema: S.Object({
    mesh: S.Type<XRMesh>(),
    // internal
    shadowMesh: S.Type<Mesh>(),
    occlusionMesh: S.Type<Mesh>(),
    geometry: S.Type<BufferGeometry>(),
    placementHelper: S.Type<Mesh>()
  }),

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, XRDetectedMeshComponent)
    const scenePlacementMode = useHookstate(getMutableState(XRState).scenePlacementMode)

    useEffect(() => {
      if (!component.mesh.value) return

      const geometry = XRDetectedMeshComponent.createGeometryFromMesh(component.mesh.value)
      component.geometry.set(geometry)

      const shadowMesh = new Mesh(geometry, shadowMaterial)
      const occlusionMesh = new Mesh(geometry, occlusionMat)
      const placementHelper = new Mesh(geometry, placementHelperMaterial)

      addObjectToGroup(entity, shadowMesh)
      addObjectToGroup(entity, occlusionMesh)
      addObjectToGroup(entity, placementHelper)
      occlusionMesh.renderOrder = -1 /** @todo make a global config for AR occlusion mesh renderOrder */

      component.shadowMesh.set(shadowMesh)
      component.occlusionMesh.set(occlusionMesh)
      component.placementHelper.set(placementHelper)

      return () => {
        removeObjectFromGroup(entity, shadowMesh)
        removeObjectFromGroup(entity, occlusionMesh)
        removeObjectFromGroup(entity, placementHelper)
      }
    }, [component.mesh])

    useEffect(() => {
      const shadowMesh = component.shadowMesh.value
      const occlusionMesh = component.occlusionMesh.value
      const geometry = component.geometry.value

      if (shadowMesh.geometry) (shadowMesh.geometry as any) = geometry
      if (occlusionMesh.geometry) (occlusionMesh.geometry as any) = geometry

      return () => {
        geometry.dispose()
      }
    }, [component.geometry])

    useEffect(() => {
      const placementHelper = component.placementHelper.value as Mesh
      placementHelper.visible = scenePlacementMode.value === 'placing'
    }, [scenePlacementMode])

    return null
  },

  createGeometryFromMesh: (mesh: XRMesh) => {
    const geometry = new BufferGeometry()

    const vertices = mesh.vertices
    const indices = mesh.indices

    geometry.setAttribute('position', new BufferAttribute(vertices, 3))
    geometry.setIndex(new BufferAttribute(indices, 1))
    geometry.computeVertexNormals()
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()

    return geometry
  },

  updateMeshGeometry: (entity: Entity, mesh: XRMesh) => {
    XRDetectedMeshComponent.meshesLastChangedTimes.set(mesh, mesh.lastChangedTime)
    const geometry = XRDetectedMeshComponent.createGeometryFromMesh(mesh)
  },

  updateMeshPose: (entity: Entity, mesh: XRMesh) => {
    const planePose = getState(XRState).xrFrame!.getPose(mesh.meshSpace, ReferenceSpace.localFloor!)!
    if (!planePose) return
    TransformComponent.position.x[entity] = planePose.transform.position.x
    TransformComponent.position.y[entity] = planePose.transform.position.y
    TransformComponent.position.z[entity] = planePose.transform.position.z
    TransformComponent.rotation.x[entity] = planePose.transform.orientation.x
    TransformComponent.rotation.y[entity] = planePose.transform.orientation.y
    TransformComponent.rotation.z[entity] = planePose.transform.orientation.z
    TransformComponent.rotation.w[entity] = planePose.transform.orientation.w
  },

  foundMesh: (mesh: XRMesh) => {
    const entity = createEntity()
    setComponent(entity, EntityTreeComponent, { parentEntity: Engine.instance.localFloorEntity })
    setComponent(entity, TransformComponent)
    setVisibleComponent(entity, true)
    setComponent(entity, XRDetectedMeshComponent)
    setComponent(entity, NameComponent, 'mesh-' + planeId++)

    XRDetectedMeshComponent.meshesLastChangedTimes.set(mesh, mesh.lastChangedTime)
    XRDetectedMeshComponent.updateMeshPose(entity, mesh)

    setComponent(entity, XRDetectedMeshComponent, { mesh: mesh })

    XRDetectedMeshComponent.detectedMeshesMap.set(mesh, entity)
  },
  detectedMeshesMap: new Map<XRMesh, Entity>(),
  meshesLastChangedTimes: new Map<XRMesh, number>()
})

let planeId = 0
