
import { useEffect } from 'react'
import { Fog, FogExp2 } from 'three'

import {
  defineComponent,
  getOptionalComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { FogComponent } from '@xrengine/spatial/src/renderer/components/SceneComponents'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { FogShaders } from '../FogSystem'
import { initBrownianMotionFogShader, initHeightFogShader, removeFogShader } from './FogShaders'
import { VisibleComponent } from './VisibleComponent'

export enum FogType {
  Disabled = 'disabled',
  Linear = 'linear',
  Exponential = 'exponential',
  Brownian = 'brownian',
  Height = 'height'
}

export const FogSettingsComponent = defineComponent({
  name: 'FogSettingsComponent',
  jsonID: 'XRENGINE_fog',

  schema: S.Object({
    type: S.Enum(FogType, FogType.Disabled),
    color: S.String('#FFFFFF'),
    density: S.Number(0.005),
    near: S.Number(1),
    far: S.Number(1000),
    timeScale: S.Number(1),
    height: S.Number(0.05)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const fog = useComponent(entity, FogSettingsComponent)
    const isVisible = useOptionalComponent(entity, VisibleComponent)

    useEffect(() => {
      if (!isVisible) {
        return
      }

      const fogData = fog.value
      switch (fogData.type) {
        case FogType.Linear:
          setComponent(entity, FogComponent, new Fog(fogData.color, fogData.near, fogData.far))
          removeFogShader()
          break

        case FogType.Exponential:
          setComponent(entity, FogComponent, new FogExp2(fogData.color, fogData.density))
          removeFogShader()
          break

        case FogType.Brownian:
          setComponent(entity, FogComponent, new FogExp2(fogData.color, fogData.density))
          initBrownianMotionFogShader()
          break

        case FogType.Height:
          setComponent(entity, FogComponent, new FogExp2(fogData.color, fogData.density))
          initHeightFogShader()
          break

        default:
          removeFogShader()
          removeComponent(entity, FogComponent)
          break
      }
      return () => {
        removeFogShader()
        removeComponent(entity, FogComponent)
      }
    }, [fog.type, isVisible])

    useEffect(() => {
      getOptionalComponent(entity, FogComponent)?.color.set(fog.color.value)
    }, [fog.color])

    useEffect(() => {
      const fogComponent = getOptionalComponent(entity, FogComponent)
      if (fogComponent && fog.type.value !== FogType.Linear) (fogComponent as FogExp2).density = fog.density.value
    }, [fog.density])

    useEffect(() => {
      const fogComponent = getOptionalComponent(entity, FogComponent)
      if (fogComponent) (fogComponent as Fog).near = fog.near.value
    }, [fog.near])

    useEffect(() => {
      const fogComponent = getOptionalComponent(entity, FogComponent)
      if (fogComponent) (fogComponent as Fog).far = fog.far.value
    }, [fog.far])

    useEffect(() => {
      const fogComponent = getOptionalComponent(entity, FogComponent)
      if (fogComponent && (fog.type.value === FogType.Brownian || fog.type.value === FogType.Height))
        for (const s of FogShaders) s.uniforms.heightFactor.value = fog.height.value
    }, [fog.height])

    useEffect(() => {
      const fogComponent = getOptionalComponent(entity, FogComponent)
      if (fogComponent && fog.type.value === FogType.Brownian)
        for (const s of FogShaders) {
          s.uniforms.fogTimeScale.value = fog.timeScale.value
        }
    }, [fog.timeScale])

    return null
  }
})
