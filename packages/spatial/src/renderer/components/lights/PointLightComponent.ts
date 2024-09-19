
import { useEffect } from 'react'
import { PointLight } from 'three'

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
import { isMobileXRHeadset } from '../../../xr/XRState'
import { RendererState } from '../../RendererState'
import { addObjectToGroup, removeObjectFromGroup } from '../GroupComponent'
import { LightTagComponent } from './LightTagComponent'

export const PointLightComponent = defineComponent({
  name: 'PointLightComponent',
  jsonID: 'XRENGINE_point_light',

  schema: S.Object({
    color: S.Color(0xffffff),
    intensity: S.Number(1),
    range: S.Number(0),
    decay: S.Number(2),
    castShadow: S.Bool(false),
    shadowBias: S.Number(0.5),
    shadowRadius: S.Number(1),
    helperEntity: S.NonSerialized(S.Nullable(S.Entity()))
  }),

  reactor: function () {
    const entity = useEntityContext()
    const renderState = useMutableState(RendererState)
    const debugEnabled = renderState.nodeHelperVisibility
    const pointLightComponent = useComponent(entity, PointLightComponent)
    const [light] = useDisposable(PointLight, entity)
    const lightHelper = useOptionalComponent(entity, LightHelperComponent)

    useEffect(() => {
      setComponent(entity, LightTagComponent)
      if (isMobileXRHeadset) return
      addObjectToGroup(entity, light)
      return () => {
        removeObjectFromGroup(entity, light)
      }
    }, [])

    useEffect(() => {
      light.color.set(pointLightComponent.color.value)
      if (lightHelper) lightHelper.color.set(pointLightComponent.color.value)
    }, [pointLightComponent.color])

    useEffect(() => {
      light.intensity = pointLightComponent.intensity.value
    }, [pointLightComponent.intensity])

    useEffect(() => {
      light.distance = pointLightComponent.range.value
    }, [pointLightComponent.range])

    useEffect(() => {
      light.decay = pointLightComponent.decay.value
    }, [pointLightComponent.decay])

    useEffect(() => {
      light.castShadow = pointLightComponent.castShadow.value
    }, [pointLightComponent.castShadow])

    useEffect(() => {
      light.shadow.bias = pointLightComponent.shadowBias.value
    }, [pointLightComponent.shadowBias])

    useEffect(() => {
      light.shadow.radius = pointLightComponent.shadowRadius.value
    }, [pointLightComponent.shadowRadius])

    useEffect(() => {
      if (light.shadow.mapSize.x !== renderState.shadowMapResolution.value) {
        light.shadow.mapSize.set(renderState.shadowMapResolution.value, renderState.shadowMapResolution.value)
        light.shadow.map?.dispose()
        light.shadow.map = null as any
        light.shadow.camera.updateProjectionMatrix()
        light.shadow.needsUpdate = true
      }
    }, [renderState.shadowMapResolution])

    useEffect(() => {
      if (debugEnabled.value) {
        setComponent(entity, LightHelperComponent, { name: 'point-light-helper', light: light })
      }
      return () => {
        removeComponent(entity, LightHelperComponent)
      }
    }, [debugEnabled])

    return null
  }
})
