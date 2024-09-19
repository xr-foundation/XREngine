
import React, { useEffect } from 'react'
import {
  Color,
  CubeReflectionMapping,
  CubeTexture,
  DataTexture,
  EquirectangularReflectionMapping,
  Material,
  Mesh,
  MeshMatcapMaterial,
  MeshStandardMaterial,
  Object3D,
  RGBAFormat,
  SRGBColorSpace,
  Texture,
  Uniform,
  Vector3
} from 'three'

import { EntityUUID, UUIDComponent, useQuery } from '@xrengine/ecs'
import {
  defineComponent,
  getComponent,
  getMutableComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { Entity, UndefinedEntity } from '@xrengine/ecs/src/Entity'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { isClient } from '@xrengine/hyperflux'
import { GroupComponent } from '@xrengine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@xrengine/spatial/src/renderer/components/MeshComponent'
import { createDisposable } from '@xrengine/spatial/src/resources/resourceHooks'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@xrengine/spatial/src/renderer/materials/MaterialComponent'
import { setPlugin } from '@xrengine/spatial/src/renderer/materials/materialFunctions'
import { useTexture } from '../../assets/functions/resourceLoaderHooks'
import {
  envmapParsReplaceLambert,
  envmapPhysicalParsReplace,
  envmapReplaceLambert,
  worldposReplace
} from '../classes/BPCEMShader'
import { EnvMapSourceType, EnvMapTextureType } from '../constants/EnvMapEnum'
import { getRGBArray, loadCubeMapTexture } from '../constants/Util'
import { addError, removeError } from '../functions/ErrorFunctions'
import { createReflectionProbeRenderTarget } from '../functions/reflectionProbeFunctions'
import { EnvMapBakeComponent } from './EnvMapBakeComponent'
import { ReflectionProbeComponent } from './ReflectionProbeComponent'

const tempColor = new Color()

const envMapSourceType = S.LiteralUnion(Object.values(EnvMapSourceType), EnvMapSourceType.None)

export const EnvmapComponent = defineComponent({
  name: 'EnvmapComponent',
  jsonID: 'XRENGINE_envmap',

  schema: S.Object({
    type: S.LiteralUnion(Object.values(EnvMapSourceType), EnvMapSourceType.None),
    envMapTextureType: S.LiteralUnion(Object.values(EnvMapTextureType), EnvMapTextureType.Equirectangular),
    envMapSourceColor: S.Color(0xfff),
    envMapSourceURL: S.String(''),
    envMapSourceEntityUUID: S.EntityUUID(),
    envMapIntensity: S.Number(1),
    // internal
    envmap: S.Nullable(S.Type<Texture>())
  }),

  reactor: function () {
    const entity = useEntityContext()
    if (!isClient) return null

    const component = useComponent(entity, EnvmapComponent)
    const mesh = useOptionalComponent(entity, MeshComponent)?.value as Mesh<any, any> | null
    const [envMapTexture, error] = useTexture(
      component.envMapTextureType.value === EnvMapTextureType.Equirectangular ? component.envMapSourceURL.value : '',
      entity
    )

    const probeQuery = useQuery([ReflectionProbeComponent])

    useEffect(() => {
      updateEnvMapIntensity(mesh, component.envMapIntensity.value)
    }, [mesh, component.envMapIntensity])

    useEffect(() => {
      if (component.type.value !== EnvMapSourceType.Skybox) return
      component.envmap.set(null)
      /** Setting the value from the skybox can be found in EnvironmentSystem */
    }, [component.type])

    useEffect(() => {
      if (component.type.value !== EnvMapSourceType.Color) return

      const col = component.envMapSourceColor.value ?? tempColor
      const resolution = 64 // Min value required
      const [texture, unload] = createDisposable(
        DataTexture,
        entity,
        getRGBArray(new Color(col)),
        resolution,
        resolution,
        RGBAFormat
      )
      texture.needsUpdate = true
      texture.colorSpace = SRGBColorSpace
      texture.mapping = EquirectangularReflectionMapping
      component.envmap.set(texture)

      return () => {
        unload()
      }
    }, [component.type, component.envMapSourceColor])

    useEffect(() => {
      if (component.type.value !== EnvMapSourceType.Probes) return
      if (!probeQuery.length) return
      const [renderTexture, unload] = createReflectionProbeRenderTarget(entity, probeQuery)
      component.envmap.set(renderTexture)
      return () => {
        unload()
        component.envmap.set(null)
      }
    }, [component.type, probeQuery.length])

    useEffect(() => {
      if (!envMapTexture) return

      envMapTexture.mapping = EquirectangularReflectionMapping
      component.envmap.set(envMapTexture)
    }, [envMapTexture])

    useEffect(() => {
      if (!error) return

      component.envmap.set(null)
      addError(entity, EnvmapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
    }, [error])

    useEffect(() => {
      if (component.type.value !== EnvMapSourceType.Texture) return

      if (component.envMapTextureType.value == EnvMapTextureType.Cubemap) {
        loadCubeMapTexture(
          component.envMapSourceURL.value,
          (texture: CubeTexture | undefined) => {
            if (texture) {
              texture.mapping = CubeReflectionMapping
              texture.colorSpace = SRGBColorSpace
              component.envmap.set(texture)
              removeError(entity, EnvmapComponent, 'MISSING_FILE')
            }
          },
          undefined,
          (_) => {
            component.envmap.set(null)
            addError(entity, EnvmapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
          }
        )
      }
    }, [component.type, component.envMapSourceURL])

    useEffect(() => {
      //if (!component.envmap.value) return
      updateEnvMap(mesh, component.envmap.value as Texture)
    }, [mesh, component.envmap])

    useEffect(() => {
      const envmap = component.envmap.value
      if (!envmap) return

      return () => {
        envmap.dispose()
      }
    }, [component.envmap])

    const bakeEntity = UUIDComponent.getEntityByUUID(component.envMapSourceEntityUUID.value)
    if (bakeEntity === UndefinedEntity) return null
    if (component.type.value !== EnvMapSourceType.Bake) return null

    return <EnvBakeComponentReactor key={bakeEntity} envmapEntity={entity} bakeEntity={bakeEntity} />
  },

  errors: ['MISSING_FILE']
})

const EnvBakeComponentReactor = (props: { envmapEntity: Entity; bakeEntity: Entity }) => {
  const { envmapEntity, bakeEntity } = props
  const bakeComponent = useComponent(bakeEntity, EnvMapBakeComponent)
  const group = useComponent(envmapEntity, GroupComponent)
  const uuid = useComponent(envmapEntity, MaterialInstanceComponent).uuid
  const [envMaptexture, error] = useTexture(bakeComponent.envMapOrigin.value, envmapEntity)
  useEffect(() => {
    const texture = envMaptexture
    if (!texture) return
    texture.mapping = EquirectangularReflectionMapping
    getMutableComponent(envmapEntity, EnvmapComponent).envmap.set(texture)
    if (bakeComponent.boxProjection.value) applyBoxProjection(bakeEntity, group.value as Object3D[])
  }, [envMaptexture, uuid])

  useEffect(() => {
    if (!error) return
    addError(envmapEntity, EnvmapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
  }, [error])

  return null
}

export function updateEnvMap(obj: Mesh<any, any> | null, envmap: Texture | null) {
  if (!obj) return
  if (!obj.material) return
  if (Array.isArray(obj.material)) {
    obj.material.forEach((mat: MeshStandardMaterial) => {
      if (mat instanceof MeshMatcapMaterial) return
      mat.envMap = envmap
      mat.needsUpdate = true
    })
  } else {
    if (obj.material instanceof MeshMatcapMaterial) return
    const material = obj.material as MeshStandardMaterial
    material.envMap = envmap
    material.needsUpdate = true
  }
}

export const updateEnvMapIntensity = (obj: Mesh<any, any> | null, intensity: number) => {
  if (!obj) return
  if (!obj.material) return
  if (Array.isArray(obj.material)) {
    obj.material.forEach((m: MeshStandardMaterial) => {
      m.envMapIntensity = intensity
    })
  } else {
    ;(obj.material as MeshStandardMaterial).envMapIntensity = intensity
  }
}

export const BoxProjectionPlugin = defineComponent({
  name: 'BoxProjectionPlugin',

  schema: S.Object({
    cubeMapSize: S.Class(() => new Uniform(new Vector3())),
    cubeMapPos: S.Class(() => new Uniform(new Vector3()))
  }),

  reactor: () => {
    const entity = useEntityContext()

    useEffect(() => {
      const materialComponent = getComponent(entity, MaterialStateComponent)

      const callback = (shader, renderer) => {
        const plugin = getComponent(entity, BoxProjectionPlugin)

        shader.uniforms.cubeMapSize = plugin.cubeMapSize
        shader.uniforms.cubeMapPos = plugin.cubeMapPos

        const shaderType = (shader as any).shaderType
        const isPhysical = shaderType === 'MeshStandardMaterial' || shaderType === 'MeshPhysicalMaterial'
        const isSupported = isPhysical || shaderType === 'MeshLambertMaterial' || shaderType === 'MeshPhongMaterial'
        if (!isSupported) return

        if (isPhysical) {
          if (!shader.vertexShader.startsWith('varying vec3 vWorldPosition'))
            shader.vertexShader = 'varying vec3 vWorldPosition;\n' + shader.vertexShader
          shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', worldposReplace)
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <envmap_physical_pars_fragment>',
            envmapPhysicalParsReplace
          )
        } else {
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <envmap_pars_fragment>',
            envmapParsReplaceLambert
          )
          shader.fragmentShader = shader.fragmentShader.replace('#include <envmap_fragment>', envmapReplaceLambert)
        }
      }

      setPlugin(materialComponent.material as Material, callback)
    })
  }
})

const applyBoxProjection = (entity: Entity, targets: Object3D[]) => {
  const bakeComponent = getComponent(entity, EnvMapBakeComponent)
  for (const target of targets) {
    const child = target as Mesh<any, MeshStandardMaterial>
    if (!child.material || child.type == 'VFXBatch') return

    const materialEntity = UUIDComponent.getEntityByUUID(child.material.uuid as EntityUUID)
    setComponent(materialEntity, BoxProjectionPlugin, {
      cubeMapPos: new Uniform(bakeComponent.bakePositionOffset),
      cubeMapSize: new Uniform(bakeComponent.bakeScale)
    })
  }
}
