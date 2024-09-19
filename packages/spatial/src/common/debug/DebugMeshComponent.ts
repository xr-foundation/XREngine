import { useEffect } from 'react'
import { BufferGeometry, Material, MeshBasicMaterial, NormalBufferAttributes } from 'three'

import { defineComponent, setComponent, useComponent, useEntityContext } from '@xrengine/ecs'
import { NO_PROXY } from '@xrengine/hyperflux'
import { matchesGeometry, matchesMaterial } from '@xrengine/spatial/src/common/functions/MatchesUtils'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { useMeshComponent } from '../../renderer/components/MeshComponent'
import { ObjectLayerMaskComponent } from '../../renderer/components/ObjectLayerComponent'
import { ObjectLayerMasks } from '../../renderer/constants/ObjectLayers'
import { useHelperEntity } from './DebugComponentUtils'

export const DebugMeshComponent = defineComponent({
  name: 'DebugMeshComponent',

  schema: S.Object({
    name: S.String('debug-mesh'),
    geometry: S.Type<BufferGeometry>(),
    material: S.Class(() => new MeshBasicMaterial() as Material),
    entity: S.Optional(S.Entity())
  }),

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.name === 'string') component.name.set(json.name)

    if (matchesGeometry.test(json.geometry)) component.geometry.set(json.geometry)
    else throw new Error('DebugMeshComponent: Geometry required for MeshHelperComponent')
    if (matchesMaterial.test(json.material)) component.material.set(json.material)
  },

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, DebugMeshComponent)
    const helperEntity = useHelperEntity(entity, component)
    const mesh = useMeshComponent(
      helperEntity,
      component.geometry.value as BufferGeometry<NormalBufferAttributes>,
      component.material.value as Material
    )

    useEffect(() => {
      setComponent(helperEntity, ObjectLayerMaskComponent, ObjectLayerMasks.NodeHelper)
    }, [])

    useEffect(() => {
      const geo = component.geometry.get(NO_PROXY)
      if (geo != mesh.geometry.value) mesh.geometry.set(geo)
    }, [component.geometry])

    useEffect(() => {
      const mat = component.material.get(NO_PROXY)
      if (mat != mesh.material.value) mesh.material.set(mat)
    }, [component.material])

    return null
  }
})
