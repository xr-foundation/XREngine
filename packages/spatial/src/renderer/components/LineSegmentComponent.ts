import { useEffect } from 'react'
import { BufferGeometry, Color, LineBasicMaterial, LineSegments, Material, NormalBufferAttributes } from 'three'

import { defineComponent, setComponent, useComponent, useEntityContext } from '@xrengine/ecs'
import { NO_PROXY } from '@xrengine/hyperflux'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { NameComponent } from '../../common/NameComponent'
import { useDisposable, useResource } from '../../resources/resourceHooks'
import { ObjectLayers } from '../constants/ObjectLayers'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { ObjectLayerMaskComponent } from './ObjectLayerComponent'
import { setVisibleComponent } from './VisibleComponent'

export const LineSegmentComponent = defineComponent({
  name: 'LineSegmentComponent',

  schema: S.Object({
    name: S.String('line-segment'),
    geometry: S.Required(S.Type<BufferGeometry>()),
    material: S.Class(() => new LineBasicMaterial() as Material),
    color: S.Optional(S.Color()),
    layerMask: S.Number(ObjectLayers.NodeHelper),
    entity: S.Optional(S.Entity())
  }),

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, LineSegmentComponent)
    const [geometryState] = useResource(component.geometry.value, entity, component.geometry.uuid.value)
    const [materialState] = useResource(component.material.value, entity, component.material.uuid.value)
    const [lineSegment] = useDisposable(
      LineSegments,
      entity,
      geometryState.value as BufferGeometry<NormalBufferAttributes>,
      materialState.value as Material
    )

    useEffect(() => {
      addObjectToGroup(entity, lineSegment)
      setVisibleComponent(entity, true)
      return () => {
        removeObjectFromGroup(entity, lineSegment)
      }
    }, [])

    useEffect(() => {
      setComponent(entity, NameComponent, component.name.value)
    }, [component.name])

    useEffect(() => {
      setComponent(entity, ObjectLayerMaskComponent, component.layerMask.value)
    }, [component.layerMask])

    useEffect(() => {
      const color = component.color.value
      if (!color) return
      const mat = component.material.get(NO_PROXY) as Material & { color?: Color }
      if (mat.color) {
        mat.color.set(color)
        mat.needsUpdate = true
      }
    }, [component.color])

    useEffect(() => {
      const geo = component.geometry.get(NO_PROXY) as BufferGeometry<NormalBufferAttributes>
      if (geo != geometryState.value) {
        geometryState.set(geo)
        lineSegment.geometry = geo
      }
    }, [component.geometry])

    useEffect(() => {
      const mat = component.material.get(NO_PROXY) as Material
      if (mat != materialState.value) {
        materialState.set(component.material.get(NO_PROXY))
        lineSegment.material = mat
      }
      mat.needsUpdate = true
    }, [component.material])

    return null
  }
})
