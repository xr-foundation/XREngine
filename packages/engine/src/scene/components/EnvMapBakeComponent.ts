import { useLayoutEffect } from 'react'
import { MeshPhysicalMaterial, SphereGeometry } from 'three'

import { defineComponent, removeComponent, setComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { getMutableState, useHookstate } from '@xrengine/hyperflux'
import { DebugMeshComponent } from '@xrengine/spatial/src/common/debug/DebugMeshComponent'
import { RendererState } from '@xrengine/spatial/src/renderer/RendererState'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { EnvMapBakeRefreshTypes } from '../types/EnvMapBakeRefreshTypes'
import { EnvMapBakeTypes } from '../types/EnvMapBakeTypes'

const sphereGeometry = new SphereGeometry(0.75)
const helperMeshMaterial = new MeshPhysicalMaterial({ roughness: 0, metalness: 1 })

export const EnvMapBakeComponent = defineComponent({
  name: 'EnvMapBakeComponent',
  jsonID: 'XRENGINE_envmapbake',

  schema: S.Object({
    bakePosition: S.Vec3(),
    bakePositionOffset: S.Vec3(),
    bakeScale: S.Vec3({ x: 1, y: 1, z: 1 }),
    bakeType: S.Enum(EnvMapBakeTypes, EnvMapBakeTypes.Baked),
    resolution: S.Number(1024),
    refreshMode: S.Enum(EnvMapBakeRefreshTypes, EnvMapBakeRefreshTypes.OnAwake),
    envMapOrigin: S.String(''),
    boxProjection: S.Bool(true)
  }),

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)

    useLayoutEffect(() => {
      if (debugEnabled.value) {
        setComponent(entity, DebugMeshComponent, {
          name: 'envmap-bake-helper',
          geometry: sphereGeometry,
          material: helperMeshMaterial
        })
      }

      return () => {
        removeComponent(entity, DebugMeshComponent)
      }
    }, [debugEnabled])

    return null
  }
})
