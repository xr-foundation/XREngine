import { useEffect } from 'react'
import { Box3, BufferGeometry, Material, Mesh } from 'three'

import { Entity, useEntityContext } from '@xrengine/ecs'
import {
  defineComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { NO_PROXY, State, useImmediateEffect } from '@xrengine/hyperflux'

import { S } from '@xrengine/ecs'
import { useResource } from '../../resources/resourceHooks'
import { BoundingBoxComponent } from '../../transform/components/BoundingBoxComponents'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'

export const MeshComponent = defineComponent({
  name: 'MeshComponent',
  jsonID: 'XRENGINE_mesh',
  schema: S.Required(S.NonSerialized(S.Type<Mesh>())),

  reactor: () => {
    const entity = useEntityContext()
    const meshComponent = useComponent(entity, MeshComponent)
    const [meshResource] = useResource(meshComponent.value, entity, meshComponent.uuid.value)
    const [geometryResource] = useResource(meshComponent.geometry.value, entity, meshComponent.geometry.uuid.value)
    const [materialResource] = useResource<Material | Material[]>(
      meshComponent.material.value as Material | Material[],
      entity,
      !Array.isArray(meshComponent.material.value) ? (meshComponent.material.value as Material).uuid : undefined
    )

    useEffect(() => {
      const box = geometryResource.boundingBox.get(NO_PROXY) as Box3 | null
      if (!box) return

      setComponent(entity, BoundingBoxComponent, { box: box })
      return () => {
        removeComponent(entity, BoundingBoxComponent)
      }
    }, [geometryResource.boundingBox])

    useEffect(() => {
      if (meshComponent.value !== meshResource.value) meshResource.set(meshComponent.value)
    }, [meshComponent])

    useEffect(() => {
      const mesh = meshComponent.value
      if (mesh.geometry !== geometryResource.value) geometryResource.set(mesh.geometry)
    }, [meshComponent.geometry])

    useEffect(() => {
      const mesh = meshComponent.value
      if (mesh.material !== materialResource.value) materialResource.set(mesh.material)

      if (Array.isArray(mesh.material)) {
        for (const material of mesh.material) material.needsUpdate = true
      } else {
        ;(mesh.material as Material).needsUpdate = true
      }
    }, [meshComponent.material])

    return null
  }
})

/**
 *
 * Creates a mesh component that won't be exported
 *
 * @param entity entity to add the mesh component to
 * @param geometry a Geometry instance or function returing a Geometry instance to add to the mesh
 * @param material a Material instance or function returing a Material instance to add to the mesh
 * @returns State<Mesh>
 */
export function useMeshComponent<TGeometry extends BufferGeometry, TMaterial extends Material>(
  entity: Entity,
  geometry: TGeometry | (() => TGeometry),
  material: TMaterial | (() => TMaterial)
): State<Mesh<TGeometry, TMaterial>> {
  if (!hasComponent(entity, MeshComponent)) {
    const geo = typeof geometry === 'function' ? geometry() : geometry
    const mat = typeof material === 'function' ? material() : material
    setComponent(entity, MeshComponent, new Mesh<TGeometry, TMaterial>(geo, mat))
  }

  const meshComponent = useComponent(entity, MeshComponent)

  useImmediateEffect(() => {
    const mesh = meshComponent.value as Mesh<TGeometry, TMaterial>
    mesh.userData['ignoreOnExport'] = true
    addObjectToGroup(entity, mesh)
    return () => {
      removeObjectFromGroup(entity, mesh)
      removeComponent(entity, MeshComponent)
    }
  }, [])

  return meshComponent as unknown as State<Mesh<TGeometry, TMaterial>>
}
