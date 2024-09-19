
import { Camera, CameraHelper } from 'three'

import { defineComponent, useComponent, useEntityContext } from '@xrengine/ecs'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { useDisposable } from '../../resources/resourceHooks'
import { useHelperEntity } from './DebugComponentUtils'

export const CameraHelperComponent = defineComponent({
  name: 'CameraHelperComponent',

  schema: S.Object({
    name: S.String('camera-helper'),
    camera: S.Type<Camera>(null!),
    entity: S.Optional(S.Entity())
  }),

  onSet: (entity, component, json) => {
    if (!json) return
    if (!json.camera || !json.camera.isCamera) throw new Error('CameraHelperComponent: Valid Camera required')
    component.camera.set(json.camera)
    if (typeof json.name === 'string') component.name.set(json.name)
  },

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, CameraHelperComponent)
    const [helper] = useDisposable(CameraHelper, entity, component.camera.value as Camera)
    useHelperEntity(entity, component, helper)
    helper.update()

    return null
  }
})
