
import { useEffect } from 'react'
import { BackSide, Mesh, MeshBasicMaterial, SphereGeometry } from 'three'

import { EntityUUID } from '@xrengine/ecs'
import {
  ComponentType,
  defineComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { Entity, UndefinedEntity } from '@xrengine/ecs/src/Entity'
import { createEntity, useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { defineState, getMutableState, getState, useHookstate } from '@xrengine/hyperflux'
import { setCallback } from '@xrengine/spatial/src/common/CallbackComponent'
import { Vector3_Right } from '@xrengine/spatial/src/common/constants/MathConstants'
import { ArrowHelperComponent } from '@xrengine/spatial/src/common/debug/ArrowHelperComponent'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { ColliderComponent } from '@xrengine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@xrengine/spatial/src/physics/components/RigidBodyComponent'
import { TriggerComponent } from '@xrengine/spatial/src/physics/components/TriggerComponent'
import { CollisionGroups } from '@xrengine/spatial/src/physics/enums/CollisionGroups'
import { Shapes } from '@xrengine/spatial/src/physics/types/PhysicsTypes'
import { addObjectToGroup, removeObjectFromGroup } from '@xrengine/spatial/src/renderer/components/GroupComponent'
import { enableObjectLayer } from '@xrengine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@xrengine/spatial/src/renderer/constants/ObjectLayers'
import { RendererState } from '@xrengine/spatial/src/renderer/RendererState'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'

export const PortalPreviewTypeSimple = 'Simple' as const
export const PortalPreviewTypeSpherical = 'Spherical' as const

export const PortalPreviewTypes = new Set<string>()
PortalPreviewTypes.add(PortalPreviewTypeSimple)
PortalPreviewTypes.add(PortalPreviewTypeSpherical)

export const PortalEffects = new Map<string, ComponentType<any>>()
PortalEffects.set('None', null!)

export const PortalState = defineState({
  name: 'PortalState',
  initial: {
    lastPortalTimeout: 0,
    portalTimeoutDuration: 5000,
    activePortalEntity: UndefinedEntity,
    portalReady: false
  }
})

export const PortalComponent = defineComponent({
  name: 'PortalComponent',
  jsonID: 'XRENGINE_portal',

  schema: S.Object({
    linkedPortalId: S.EntityUUID(),
    location: S.String(''),
    effectType: S.String('None'),
    previewType: S.String(PortalPreviewTypeSimple),
    previewImageURL: S.String(''),
    redirect: S.Bool(false),
    spawnPosition: S.Vec3(),
    spawnRotation: S.Quaternion(),
    remoteSpawnPosition: S.Vec3(),
    remoteSpawnRotation: S.Quaternion(),
    mesh: S.Nullable(S.Type<Mesh<SphereGeometry, MeshBasicMaterial>>())
  }),

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)
    const portalComponent = useComponent(entity, PortalComponent)

    useEffect(() => {
      setCallback(entity, 'teleport', (triggerEntity: Entity, otherEntity: Entity) => {
        if (otherEntity !== AvatarComponent.getSelfAvatarEntity()) return
        const now = Date.now()
        const { lastPortalTimeout, portalTimeoutDuration, activePortalEntity } = getState(PortalState)
        if (activePortalEntity || lastPortalTimeout + portalTimeoutDuration > now) return
        getMutableState(PortalState).activePortalEntity.set(entity)
      })

      /** Allow scene data populating rigidbody component too */
      if (hasComponent(entity, RigidBodyComponent)) return
      setComponent(entity, RigidBodyComponent, { type: 'fixed' })
      setComponent(entity, ColliderComponent, {
        shape: Shapes.Sphere,
        collisionLayer: CollisionGroups.Trigger,
        collisionMask: CollisionGroups.Avatars
      })
      setComponent(entity, TriggerComponent, {
        triggers: [
          {
            onEnter: 'teleport',
            onExit: null,
            target: '' as EntityUUID
          }
        ]
      })
    }, [])

    useEffect(() => {
      if (debugEnabled.value) {
        setComponent(entity, ArrowHelperComponent, {
          name: 'portal-helper',
          length: 1,
          dir: Vector3_Right,
          color: 0x000000
        })
      }
      return () => {
        removeComponent(entity, ArrowHelperComponent)
      }
    }, [debugEnabled])

    useEffect(() => {
      if (portalComponent.previewType.value !== PortalPreviewTypeSpherical) return

      const portalMesh = new Mesh(new SphereGeometry(1, 32, 32), new MeshBasicMaterial({ side: BackSide }))
      enableObjectLayer(portalMesh, ObjectLayers.Camera, true)
      portalComponent.mesh.set(portalMesh)
      addObjectToGroup(entity, portalMesh)

      return () => {
        removeObjectFromGroup(entity, portalMesh)
      }
    }, [portalComponent.previewType])

    /** @todo - reimplement once spawn points are refactored */
    // const portalDetails = useGet(spawnPointPath, portalComponent.linkedPortalId.value)

    // const [texture] = useTexture(portalDetails.data?.previewImageURL || '', entity)

    // useEffect(() => {
    //   if (!texture || !portalComponent.mesh.value) return

    //   const material = portalComponent.mesh.value.material as MeshBasicMaterial
    //   material.map = texture
    //   material.needsUpdate = true
    // }, [texture, portalComponent.mesh])

    // useEffect(() => {
    //   if (!portalDetails.data) return
    //   portalComponent.remoteSpawnPosition.value.copy(portalDetails.data.position as Vector3)
    //   portalComponent.remoteSpawnRotation.value.copy(portalDetails.data.rotation as Quaternion)
    // }, [portalDetails])

    return null
  },

  setPlayerInPortalEffect: (effectType: string) => {
    const entity = createEntity()
    setComponent(entity, EntityTreeComponent)
    setComponent(entity, NameComponent, 'portal-' + effectType)
    setComponent(entity, VisibleComponent)
    setComponent(entity, PortalEffects.get(effectType))
  }
})
