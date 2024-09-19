
import { useLayoutEffect } from 'react'

import { defineComponent, hasComponent, setComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { getMutableState, none, useHookstate } from '@xrengine/hyperflux'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { RendererState } from '@xrengine/spatial/src/renderer/RendererState'
import { addObjectToGroup, removeObjectFromGroup } from '@xrengine/spatial/src/renderer/components/GroupComponent'
import { setObjectLayers } from '@xrengine/spatial/src/renderer/components/ObjectLayerComponent'
import { setVisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@xrengine/spatial/src/renderer/constants/ObjectLayers'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { useGLTF } from '../../assets/functions/resourceLoaderHooks'

const GLTF_PATH = '/static/editor/spawn-point.glb'

export const SpawnPointComponent = defineComponent({
  name: 'SpawnPointComponent',
  jsonID: 'XRENGINE_spawn_point',

  schema: S.Object({
    permissionedUsers: S.Array(S.UserID()),
    helperEntity: S.Nullable(S.Entity())
  }),

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)
    const spawnPoint = useComponent(entity, SpawnPointComponent)

    const [gltf] = useGLTF(debugEnabled.value ? GLTF_PATH : '', entity)

    useLayoutEffect(() => {
      const scene = gltf?.scene
      if (!scene || !debugEnabled.value) return

      const helperEntity = createEntity()
      setComponent(helperEntity, EntityTreeComponent, { parentEntity: entity })
      spawnPoint.helperEntity.set(helperEntity)

      scene.name = `spawn-point-helper-${entity}`
      addObjectToGroup(helperEntity, scene)
      setObjectLayers(scene, ObjectLayers.NodeHelper)
      setComponent(helperEntity, NameComponent, scene.name)

      setVisibleComponent(spawnPoint.helperEntity.value!, true)

      return () => {
        removeObjectFromGroup(helperEntity, scene)
        removeEntity(helperEntity)
        if (!hasComponent(entity, SpawnPointComponent)) return
        spawnPoint.helperEntity.set(none)
      }
    }, [gltf, debugEnabled])

    return null
  }
})
