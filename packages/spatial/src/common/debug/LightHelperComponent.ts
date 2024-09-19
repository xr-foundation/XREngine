
import { useEffect } from 'react'
import {
  Camera,
  DirectionalLight,
  DirectionalLightHelper,
  HemisphereLight,
  HemisphereLightHelper,
  Light,
  LightShadow,
  PointLightHelper,
  SpotLight,
  SpotLightHelper
} from 'three'

import { defineComponent, useComponent, useEntityContext } from '@xrengine/ecs'
import { matchesColor } from '@xrengine/spatial/src/common/functions/MatchesUtils'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { useDisposable } from '../../resources/resourceHooks'
import { useHelperEntity } from './DebugComponentUtils'

const getLightHelperType = (light: Light) => {
  if ((light as DirectionalLight).isDirectionalLight) return DirectionalLightHelper
  else if ((light as SpotLight).isSpotLight) return SpotLightHelper
  else if ((light as HemisphereLight).isHemisphereLight) return HemisphereLightHelper
  else return PointLightHelper
}

export const LightHelperComponent = defineComponent({
  name: 'LightHelperComponent',

  schema: S.Object({
    name: S.String('light-helper'),
    light: S.Type<Light>(),
    size: S.Number(1),
    color: S.Optional(S.Color()),
    entity: S.Optional(S.Entity())
  }),

  onSet: (entity, component, json) => {
    if (!json) return

    if (!json.light || !json.light.isLight) throw new Error('LightHelperComponent: Valid Light required')
    component.light.set(json.light)
    if (typeof json.name === 'string') component.name.set(json.name)
    if (typeof json.size === 'number') component.size.set(json.size)
    if (matchesColor.test(json.color)) component.color.set(json.color)
  },

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, LightHelperComponent)
    const light = component.light.value as Light<LightShadow<Camera>>
    const [helper] = useDisposable(getLightHelperType(light), entity, light, component.size.value)
    useHelperEntity(entity, component, helper)
    helper.update()

    useEffect(() => {
      helper.color = component.color.value
      helper.update()
    }, [component.color])

    return null
  }
})
