import { useEffect } from 'react'
import { HemisphereLight } from 'three'

import {
  defineComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { useMutableState } from '@xrengine/hyperflux'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { LightHelperComponent } from '../../../common/debug/LightHelperComponent'
import { useDisposable } from '../../../resources/resourceHooks'
import { RendererState } from '../../RendererState'
import { addObjectToGroup, removeObjectFromGroup } from '../GroupComponent'
import { LightTagComponent } from './LightTagComponent'

export const HemisphereLightComponent = defineComponent({
  name: 'HemisphereLightComponent',
  jsonID: 'XRENGINE_hemisphere_light',

  schema: S.Object({
    skyColor: S.Color(0xffffff),
    groundColor: S.Color(0xffffff),
    intensity: S.Number(1)
  }),

  reactor: function () {
    const entity = useEntityContext()
    const hemisphereLightComponent = useComponent(entity, HemisphereLightComponent)
    const renderState = useMutableState(RendererState)
    const debugEnabled = renderState.nodeHelperVisibility
    const [light] = useDisposable(HemisphereLight, entity)
    const lightHelper = useOptionalComponent(entity, LightHelperComponent)

    useEffect(() => {
      setComponent(entity, LightTagComponent)
      addObjectToGroup(entity, light)
      return () => {
        removeObjectFromGroup(entity, light)
      }
    }, [])

    useEffect(() => {
      light.groundColor.set(hemisphereLightComponent.groundColor.value)
    }, [hemisphereLightComponent.groundColor])

    useEffect(() => {
      light.color.set(hemisphereLightComponent.skyColor.value)
      if (lightHelper) lightHelper.color.set(hemisphereLightComponent.skyColor.value)
    }, [hemisphereLightComponent.skyColor])

    useEffect(() => {
      light.intensity = hemisphereLightComponent.intensity.value
    }, [hemisphereLightComponent.intensity])

    useEffect(() => {
      if (debugEnabled.value) {
        setComponent(entity, LightHelperComponent, { name: 'hemisphere-light-helper', light: light })
      }
      return () => {
        removeComponent(entity, LightHelperComponent)
      }
    }, [debugEnabled])

    return null
  }
})
