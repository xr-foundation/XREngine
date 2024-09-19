import { useEffect } from 'react'
import { Color, CubeReflectionMapping, CubeTexture, EquirectangularReflectionMapping, SRGBColorSpace } from 'three'

import { Engine } from '@xrengine/ecs'
import {
  defineComponent,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { entityExists, useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { getState, isClient, useImmediateEffect } from '@xrengine/hyperflux'
import { RendererComponent } from '@xrengine/spatial/src/renderer/WebGLRendererSystem'
import { BackgroundComponent } from '@xrengine/spatial/src/renderer/components/SceneComponents'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { useTexture } from '../../assets/functions/resourceLoaderHooks'
import { DomainConfigState } from '../../assets/state/DomainConfigState'
import { Sky } from '../classes/Sky'
import { SkyTypeEnum } from '../constants/SkyTypeEnum'
import { loadCubeMapTexture } from '../constants/Util'
import { addError, removeError } from '../functions/ErrorFunctions'

export const SkyboxComponent = defineComponent({
  name: 'SkyboxComponent',
  jsonID: 'XRENGINE_skybox',

  schema: S.Object({
    backgroundColor: S.Color(0x000000),
    equirectangularPath: S.String(''),
    cubemapPath: S.String(''),
    backgroundType: S.Number(1),
    sky: S.Nullable(S.Type<Sky>()),
    skyboxProps: S.Object({
      turbidity: S.Number(10),
      rayleigh: S.Number(1),
      luminance: S.Number(1),
      mieCoefficient: S.Number(0.004999999999999893),
      mieDirectionalG: S.Number(0.99),
      inclination: S.Number(0.10471975511965978),
      azimuth: S.Number(0.16666666666666666)
    })
  }),

  reactor: function () {
    const entity = useEntityContext()
    if (!isClient) return null

    const skyboxState = useComponent(entity, SkyboxComponent)

    const [texture, error] = useTexture(skyboxState.equirectangularPath.value, entity)

    useImmediateEffect(() => {
      if (!skyboxState.cubemapPath.value)
        skyboxState.cubemapPath.set(
          `${getState(DomainConfigState).cloudDomain}/projects/xrengine/default-project/assets/skyboxsun25deg/`
        )
      return () => {
        if (entityExists(entity) && hasComponent(entity, BackgroundComponent))
          removeComponent(entity, BackgroundComponent)
      }
    }, [])

    useEffect(() => {
      if (skyboxState.backgroundType.value !== SkyTypeEnum.equirectangular) return

      if (texture) {
        texture.colorSpace = SRGBColorSpace
        texture.mapping = EquirectangularReflectionMapping
        setComponent(entity, BackgroundComponent, texture)
        removeError(entity, SkyboxComponent, 'FILE_ERROR')
      } else if (error) {
        addError(entity, SkyboxComponent, 'FILE_ERROR', error.message)
      }
    }, [texture, error, skyboxState.backgroundType, skyboxState.equirectangularPath])

    useEffect(() => {
      if (skyboxState.backgroundType.value !== SkyTypeEnum.color) return
      setComponent(entity, BackgroundComponent, new Color(skyboxState.backgroundColor.value))
    }, [skyboxState.backgroundType, skyboxState.backgroundColor])

    useEffect(() => {
      if (skyboxState.backgroundType.value !== SkyTypeEnum.cubemap) return
      const onLoad = (texture: CubeTexture) => {
        texture.colorSpace = SRGBColorSpace
        texture.mapping = CubeReflectionMapping
        setComponent(entity, BackgroundComponent, texture)
        removeError(entity, SkyboxComponent, 'FILE_ERROR')
      }
      const loadArgs: [
        string,
        (texture: CubeTexture) => void,
        ((event: ProgressEvent<EventTarget>) => void) | undefined,
        ((event: ErrorEvent) => void) | undefined
      ] = [
        skyboxState.cubemapPath.value,
        onLoad,
        undefined,
        (error) => addError(entity, SkyboxComponent, 'FILE_ERROR', error.message)
      ]
      /** @todo replace this with useCubemap */
      loadCubeMapTexture(...loadArgs)
    }, [skyboxState.backgroundType, skyboxState.cubemapPath])

    useEffect(() => {
      if (skyboxState.backgroundType.value !== SkyTypeEnum.skybox) {
        if (skyboxState.sky.value) skyboxState.sky.set(null)
        return
      }

      skyboxState.sky.set(new Sky())

      const sky = skyboxState.sky.value! as Sky

      sky.azimuth = skyboxState.skyboxProps.value.azimuth
      sky.inclination = skyboxState.skyboxProps.value.inclination

      sky.mieCoefficient = skyboxState.skyboxProps.value.mieCoefficient
      sky.mieDirectionalG = skyboxState.skyboxProps.value.mieDirectionalG
      sky.rayleigh = skyboxState.skyboxProps.value.rayleigh
      sky.turbidity = skyboxState.skyboxProps.value.turbidity
      sky.luminance = skyboxState.skyboxProps.value.luminance

      const renderer = getComponent(Engine.instance.viewerEntity, RendererComponent)

      const texture = sky.generateSkyboxTextureCube(renderer.renderer!)
      texture.mapping = CubeReflectionMapping

      setComponent(entity, BackgroundComponent, texture)
      sky.dispose()
    }, [
      skyboxState.backgroundType,
      skyboxState.skyboxProps,
      skyboxState.skyboxProps.azimuth,
      skyboxState.skyboxProps.inclination,
      skyboxState.skyboxProps.mieCoefficient,
      skyboxState.skyboxProps.mieDirectionalG,
      skyboxState.skyboxProps.rayleigh,
      skyboxState.skyboxProps.turbidity,
      skyboxState.skyboxProps.luminance
    ])

    return null
  },

  errors: ['FILE_ERROR']
})
