
import { useEffect } from 'react'
import { AmbientLight } from 'three'

import { defineComponent, setComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { useDisposable } from '../../../resources/resourceHooks'
import { addObjectToGroup, removeObjectFromGroup } from '../GroupComponent'
import { LightTagComponent } from './LightTagComponent'

export const AmbientLightComponent = defineComponent({
  name: 'AmbientLightComponent',
  jsonID: 'XRENGINE_ambient_light',

  schema: S.Object({
    color: S.Color(0xffffff),
    intensity: S.Number(1)
  }),

  reactor: function () {
    const entity = useEntityContext()
    const ambientLightComponent = useComponent(entity, AmbientLightComponent)
    const [light] = useDisposable(AmbientLight, entity)

    useEffect(() => {
      setComponent(entity, LightTagComponent)
      addObjectToGroup(entity, light)
      return () => {
        removeObjectFromGroup(entity, light)
      }
    }, [])

    useEffect(() => {
      light.color.set(ambientLightComponent.color.value)
    }, [ambientLightComponent.color])

    useEffect(() => {
      light.intensity = ambientLightComponent.intensity.value
    }, [ambientLightComponent.intensity])

    return null
  }
})
