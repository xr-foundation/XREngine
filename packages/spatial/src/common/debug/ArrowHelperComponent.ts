
import { ArrowHelper } from 'three'

import { defineComponent, useComponent, useEntityContext } from '@xrengine/ecs'
import { useDidMount } from '@xrengine/hyperflux'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { useDisposable } from '../../resources/resourceHooks'
import { useHelperEntity } from './DebugComponentUtils'

export const ArrowHelperComponent = defineComponent({
  name: 'ArrowHelperComponent',

  schema: S.Object({
    name: S.String('arrow-helper'),
    dir: S.Vec3({ x: 0, y: 0, z: 1 }),
    origin: S.Vec3({ x: 0, y: 0, z: 0 }),
    length: S.Number(0.5),
    color: S.Color(0xffffff),
    headLength: S.Optional(S.Number()),
    headWidth: S.Optional(S.Number()),
    entity: S.Optional(S.Entity())
  }),

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, ArrowHelperComponent)
    const [helper] = useDisposable(
      ArrowHelper,
      entity,
      component.dir.value,
      // Origin value isn't updatable in ArrowHelper
      component.origin.value,
      component.length.value,
      component.color.value,
      component.headLength.value,
      component.headWidth.value
    )
    useHelperEntity(entity, component, helper)

    useDidMount(() => {
      helper.setDirection(component.dir.value)
      helper.setColor(component.color.value)
      helper.setLength(component.length.value, component.headLength.value, component.headWidth.value)
    }, [component.dir, component.length, component.color, component.headLength, component.headWidth])

    return null
  }
})
