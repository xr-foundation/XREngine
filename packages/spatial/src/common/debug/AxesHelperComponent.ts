
import { AxesHelper } from 'three'

import { defineComponent, useComponent, useEntityContext } from '@xrengine/ecs'
import { ObjectLayerMasks } from '@xrengine/spatial/src/renderer/constants/ObjectLayers'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { useDisposable } from '../../resources/resourceHooks'
import { useHelperEntity } from './DebugComponentUtils'

export const AxesHelperComponent = defineComponent({
  name: 'AxesHelperComponent',

  schema: S.Object({
    name: S.String('axes-helper'),
    size: S.Number(1),
    layerMask: S.Number(ObjectLayerMasks.NodeHelper),
    entity: S.Optional(S.Entity())
  }),

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, AxesHelperComponent)
    const [helper] = useDisposable(AxesHelper, entity, component.size.value)
    useHelperEntity(entity, component, helper, component.layerMask.value)

    return null
  }
})
