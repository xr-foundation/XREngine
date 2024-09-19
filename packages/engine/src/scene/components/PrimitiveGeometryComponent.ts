
import { useLayoutEffect } from 'react'
import { MeshLambertMaterial } from 'three'

import { defineComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { Geometry } from '@xrengine/spatial/src/common/constants/Geometry'
import { useMeshComponent } from '@xrengine/spatial/src/renderer/components/MeshComponent'
import { GeometryTypeEnum, GeometryTypeToFactory } from '../constants/GeometryTypeEnum'

const createGeometry = (geometryType: GeometryTypeEnum, geometryParams: Record<string, any>): Geometry => {
  const factory = GeometryTypeToFactory[geometryType]
  const geometry = factory(geometryParams)
  return geometry
}

export const PrimitiveGeometryComponent = defineComponent({
  name: 'PrimitiveGeometryComponent',
  jsonID: 'XRENGINE_primitive_geometry',

  schema: S.Object({
    geometryType: S.Enum(GeometryTypeEnum, GeometryTypeEnum.BoxGeometry),
    geometryParams: S.Record(S.String(), S.Any())
  }),

  reactor: () => {
    const entity = useEntityContext()
    const geometryComponent = useComponent(entity, PrimitiveGeometryComponent)
    const mesh = useMeshComponent(
      entity,
      () => createGeometry(geometryComponent.geometryType.value, geometryComponent.geometryParams.value),
      () => new MeshLambertMaterial()
    )

    useLayoutEffect(() => {
      mesh.geometry.set(createGeometry(geometryComponent.geometryType.value, geometryComponent.geometryParams.value))
    }, [geometryComponent.geometryType, geometryComponent.geometryParams])

    return null
  }
})
