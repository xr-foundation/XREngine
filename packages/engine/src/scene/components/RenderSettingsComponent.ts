import { useEffect } from 'react'
import {
  ACESFilmicToneMapping,
  BasicShadowMap,
  CineonToneMapping,
  CustomToneMapping,
  LinearToneMapping,
  NoToneMapping,
  PCFShadowMap,
  PCFSoftShadowMap,
  ReinhardToneMapping,
  VSMShadowMap
} from 'three'

import { defineComponent, getComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { RendererComponent } from '@xrengine/spatial/src/renderer/WebGLRendererSystem'
import { useRendererEntity } from '@xrengine/spatial/src/renderer/functions/useRendererEntity'

const ToneMappingSchema = S.LiteralUnion(
  [NoToneMapping, LinearToneMapping, ReinhardToneMapping, CineonToneMapping, ACESFilmicToneMapping, CustomToneMapping],
  LinearToneMapping
)

const ShadowMapSchema = S.LiteralUnion([BasicShadowMap, PCFShadowMap, PCFSoftShadowMap, VSMShadowMap], PCFSoftShadowMap)

export const RenderSettingsComponent = defineComponent({
  name: 'RenderSettingsComponent',
  jsonID: 'XRENGINE_render_settings',

  schema: S.Object({
    primaryLight: S.EntityUUID(),
    csm: S.Bool(true),
    cascades: S.Number(5),
    toneMapping: ToneMappingSchema,
    toneMappingExposure: S.Number(0.8),
    shadowMapType: ShadowMapSchema
  }),

  reactor: () => {
    const entity = useEntityContext()
    const rendererEntity = useRendererEntity(entity)
    const component = useComponent(entity, RenderSettingsComponent)

    useEffect(() => {
      if (!rendererEntity) return
      const renderer = getComponent(rendererEntity, RendererComponent).renderer!
      renderer.toneMapping = component.toneMapping.value
    }, [component.toneMapping])

    useEffect(() => {
      if (!rendererEntity) return
      const renderer = getComponent(rendererEntity, RendererComponent).renderer!
      renderer.toneMappingExposure = component.toneMappingExposure.value
    }, [component.toneMappingExposure])

    useEffect(() => {
      if (!rendererEntity) return
      const renderer = getComponent(rendererEntity, RendererComponent).renderer!
      renderer.shadowMap.type = component.shadowMapType.value
      renderer.shadowMap.needsUpdate = true
    }, [component.shadowMapType])

    return null
  }
})
