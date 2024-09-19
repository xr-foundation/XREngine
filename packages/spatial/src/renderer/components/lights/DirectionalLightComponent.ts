import { useEffect } from 'react'
import { BufferGeometry, DirectionalLight, Float32BufferAttribute } from 'three'

import {
  defineComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { useImmediateEffect, useMutableState } from '@xrengine/hyperflux'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { mergeBufferGeometries } from '../../../common/classes/BufferGeometryUtils'
import { useDisposable } from '../../../resources/resourceHooks'
import { RendererState } from '../../RendererState'
import { useUpdateLight } from '../../functions/useUpdateLight'
import { addObjectToGroup, removeObjectFromGroup } from '../GroupComponent'
import { LineSegmentComponent } from '../LineSegmentComponent'
import { LightTagComponent } from './LightTagComponent'

const size = 1
const lightPlaneGeometry = new BufferGeometry()
lightPlaneGeometry.setAttribute(
  'position',
  new Float32BufferAttribute(
    [
      -size,
      size,
      0,
      size,
      size,
      0,
      size,
      size,
      0,
      size,
      -size,
      0,
      size,
      -size,
      0,
      -size,
      -size,
      0,
      -size,
      -size,
      0,
      -size,
      size,
      0,
      -size,
      size,
      0,
      size,
      -size,
      0,
      size,
      size,
      0,
      -size,
      -size,
      0
    ],
    3
  )
)

const targetLineGeometry = new BufferGeometry()
const t = size * 0.1
targetLineGeometry.setAttribute(
  'position',
  new Float32BufferAttribute([-t, t, 0, 0, 0, 1, t, t, 0, 0, 0, 1, t, -t, 0, 0, 0, 1, -t, -t, 0, 0, 0, 1], 3)
)

const mergedGeometry = mergeBufferGeometries([targetLineGeometry, lightPlaneGeometry])

export const DirectionalLightComponent = defineComponent({
  name: 'DirectionalLightComponent',
  jsonID: 'XRENGINE_directional_light',

  schema: S.Object({
    light: S.NonSerialized(S.Type<DirectionalLight>()),
    color: S.Color(),
    intensity: S.Number(1),
    castShadow: S.Bool(false),
    shadowBias: S.Number(-0.00001),
    shadowRadius: S.Number(1),
    cameraFar: S.Number(200)
  }),

  reactor: function () {
    const entity = useEntityContext()
    const renderState = useMutableState(RendererState)
    const debugEnabled = renderState.nodeHelperVisibility
    const directionalLightComponent = useComponent(entity, DirectionalLightComponent)
    const [light] = useDisposable(DirectionalLight, entity)
    const lightHelper = useOptionalComponent(entity, LineSegmentComponent)

    useImmediateEffect(() => {
      setComponent(entity, LightTagComponent)
      directionalLightComponent.light.set(light)
      addObjectToGroup(entity, light)
      return () => {
        removeObjectFromGroup(entity, light)
      }
    }, [])

    useEffect(() => {
      light.color.set(directionalLightComponent.color.value)
      if (!lightHelper) return
      lightHelper.color.set(directionalLightComponent.color.value)
    }, [directionalLightComponent.color])

    useEffect(() => {
      light.intensity = directionalLightComponent.intensity.value
    }, [directionalLightComponent.intensity])

    useEffect(() => {
      light.shadow.camera.far = directionalLightComponent.cameraFar.value
      light.shadow.camera.updateProjectionMatrix()
    }, [directionalLightComponent.cameraFar])

    useEffect(() => {
      light.shadow.bias = directionalLightComponent.shadowBias.value
    }, [directionalLightComponent.shadowBias])

    useEffect(() => {
      light.shadow.radius = directionalLightComponent.shadowRadius.value
    }, [directionalLightComponent.shadowRadius])

    useEffect(() => {
      if (light.shadow.mapSize.x !== renderState.shadowMapResolution.value) {
        light.shadow.mapSize.setScalar(renderState.shadowMapResolution.value)
        light.shadow.map?.dispose()
        light.shadow.map = null as any
        light.shadow.camera.updateProjectionMatrix()
        light.shadow.needsUpdate = true
      }
    }, [renderState.shadowMapResolution])

    useEffect(() => {
      if (debugEnabled.value) {
        setComponent(entity, LineSegmentComponent, {
          name: 'directional-light-helper',
          // Clone geometry because LineSegmentComponent disposes it when removed
          geometry: mergedGeometry?.clone(),
          color: directionalLightComponent.color.value
        })

        return () => {
          removeComponent(entity, LineSegmentComponent)
        }
      }
    }, [debugEnabled])

    useUpdateLight(light)

    return null
  }
})
