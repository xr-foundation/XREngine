
import { useEffect } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  InterleavedBufferAttribute,
  Line,
  LineBasicMaterial,
  Material,
  MathUtils
} from 'three'

import { defineComponent, useComponent, useEntityContext } from '@xrengine/ecs'
import { NO_PROXY, useDidMount } from '@xrengine/hyperflux'
import { useHelperEntity } from '@xrengine/spatial/src/common/debug/DebugComponentUtils'
import { useDisposable, useResource } from '@xrengine/spatial/src/resources/resourceHooks'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { AudioNodeGroup } from '../../scene/components/MediaComponent'

export const PositionalAudioHelperComponent = defineComponent({
  name: 'PositionalAudioHelperComponent',

  schema: S.Object({
    name: S.String('positional-audio-helper'),
    audio: S.Type<AudioNodeGroup>(),
    range: S.Number(1),
    divisionsInnerAngle: S.Number(16),
    divisionsOuterAngle: S.Number(2),
    divisions: S.Number(0),
    entity: S.Entity()
  }),

  onSet: (entity, component, json) => {
    if (!json) return

    if (!json.audio) throw new Error('PositionalAudioHelperComponent: Valid AudioNodeGroup required')
    component.audio.set(json.audio)
    if (typeof json.name === 'string') component.name.set(json.name)
    if (typeof json.range === 'number') component.range.set(json.range)
    if (typeof json.divisionsInnerAngle === 'number') component.divisionsInnerAngle.set(json.divisionsInnerAngle)
    if (typeof json.divisionsOuterAngle === 'number') component.divisionsOuterAngle.set(json.divisionsOuterAngle)
    component.divisions.set(component.divisionsInnerAngle.value + component.divisionsOuterAngle.value * 2)
  },

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, PositionalAudioHelperComponent)

    const createGeometry = () => {
      const geometry = new BufferGeometry()
      const positions = new Float32Array((component.divisions.value * 3 + 3) * 3)
      geometry.setAttribute('position', new BufferAttribute(positions, 3))
      return geometry
    }

    const [geometryState] = useResource<BufferGeometry>(createGeometry, entity)
    const [materialInnerAngle] = useResource(() => new LineBasicMaterial({ color: 0x00ff00 }), entity)
    const [materialOuterAngle] = useResource(() => new LineBasicMaterial({ color: 0xffff00 }), entity)
    const [line] = useDisposable(
      Line<BufferGeometry, LineBasicMaterial[]>,
      entity,
      geometryState.value as BufferGeometry,
      [materialOuterAngle.value as LineBasicMaterial, materialInnerAngle.value as LineBasicMaterial]
    )
    useHelperEntity(entity, component, line)

    useDidMount(() => {
      component.divisions.set(component.divisionsInnerAngle.value + component.divisionsOuterAngle.value * 2)
    }, [component.divisionsInnerAngle, component.divisionsOuterAngle])

    useDidMount(() => {
      geometryState.set(createGeometry())
      line.geometry = geometryState.get(NO_PROXY) as BufferGeometry
    }, [component.divisions])

    useEffect(() => {
      const audio = component.audio.value
      if (!audio.panner) return
      const range = component.range.value
      const divisionsInnerAngle = component.divisionsInnerAngle.value
      const divisionsOuterAngle = component.divisionsOuterAngle.value
      const geometry = geometryState.get(NO_PROXY)
      const materials = [materialOuterAngle.get(NO_PROXY), materialInnerAngle.get(NO_PROXY)]

      const coneInnerAngle = MathUtils.degToRad(audio.panner.coneInnerAngle)
      const coneOuterAngle = MathUtils.degToRad(audio.panner.coneOuterAngle)

      const halfConeInnerAngle = coneInnerAngle / 2
      const halfConeOuterAngle = coneOuterAngle / 2

      let start = 0
      let count = 0
      let i
      let stride

      const positionAttribute = geometry.attributes.position as BufferAttribute | InterleavedBufferAttribute

      geometry.clearGroups()

      function generateSegment(from, to, divisions, materialIndex) {
        const step = (to - from) / divisions

        positionAttribute.setXYZ(start, 0, 0, 0)
        count++

        for (i = from; i < to; i += step) {
          stride = start + count

          positionAttribute.setXYZ(stride, Math.sin(i) * range, 0, Math.cos(i) * range)
          positionAttribute.setXYZ(
            stride + 1,
            Math.sin(Math.min(i + step, to)) * range,
            0,
            Math.cos(Math.min(i + step, to)) * range
          )
          positionAttribute.setXYZ(stride + 2, 0, 0, 0)

          count += 3
        }

        geometry.addGroup(start, count, materialIndex)

        start += count
        count = 0
      }

      generateSegment(-halfConeOuterAngle, -halfConeInnerAngle, divisionsOuterAngle, 0)
      generateSegment(-halfConeInnerAngle, halfConeInnerAngle, divisionsInnerAngle, 1)
      generateSegment(halfConeInnerAngle, halfConeOuterAngle, divisionsOuterAngle, 0)

      positionAttribute.needsUpdate = true

      if (coneInnerAngle === coneOuterAngle) (materials[0] as Material).visible = false
    }, [component.audio, component.range, component.divisions])

    return null
  }
})
