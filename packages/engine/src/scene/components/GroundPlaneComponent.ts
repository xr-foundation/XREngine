
import { useLayoutEffect } from 'react'
import { ColorRepresentation, Mesh, MeshLambertMaterial, PlaneGeometry, ShadowMaterial } from 'three'

import { defineComponent, removeComponent, setComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { matches } from '@xrengine/hyperflux'
import { matchesColor } from '@xrengine/spatial/src/common/functions/MatchesUtils'
import { ColliderComponent } from '@xrengine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@xrengine/spatial/src/physics/components/RigidBodyComponent'
import { CollisionGroups } from '@xrengine/spatial/src/physics/enums/CollisionGroups'
import { BodyTypes, Shapes } from '@xrengine/spatial/src/physics/types/PhysicsTypes'
import { useMeshComponent } from '@xrengine/spatial/src/renderer/components/MeshComponent'
import { ObjectLayerMaskComponent } from '@xrengine/spatial/src/renderer/components/ObjectLayerComponent'
import { ObjectLayerMasks } from '@xrengine/spatial/src/renderer/constants/ObjectLayers'

export const GroundPlaneComponent = defineComponent({
  name: 'GroundPlaneComponent',
  jsonID: 'XRENGINE_ground_plane',

  schema: S.Object({
    color: S.Color(0xffffff),
    visible: S.Bool(true)
  }),

  onInit(entity) {
    return {
      color: 0xffffff as ColorRepresentation,
      visible: true
    }
  },

  onSet(entity, component, json) {
    if (!json) return

    if (matchesColor.test(json.color)) component.color.set(json.color)
    if (matches.boolean.test(json.visible)) component.visible.set(json.visible)
  },

  toJSON: (component) => {
    return {
      color: component.color,
      visible: component.visible
    }
  },

  reactor: function () {
    const entity = useEntityContext()

    const component = useComponent(entity, GroundPlaneComponent)

    const getMaterial = (): MeshLambertMaterial | ShadowMaterial => {
      return component.visible.value ? new MeshLambertMaterial() : new ShadowMaterial({ opacity: 0.5 })
    }

    const mesh = useMeshComponent(entity, () => new PlaneGeometry(10000, 10000), getMaterial)

    useLayoutEffect(() => {
      const meshVal = mesh.value as Mesh<PlaneGeometry, MeshLambertMaterial | ShadowMaterial>
      meshVal.geometry.rotateX(-Math.PI / 2)
      meshVal.name = 'GroundPlaneMesh'
      meshVal.material.polygonOffset = true
      meshVal.material.polygonOffsetFactor = -0.01
      meshVal.material.polygonOffsetUnits = 1

      setComponent(entity, ObjectLayerMaskComponent, ObjectLayerMasks.Scene)
      setComponent(entity, RigidBodyComponent, { type: BodyTypes.Fixed })
      setComponent(entity, ColliderComponent, {
        shape: Shapes.Plane,
        collisionLayer: CollisionGroups.Ground,
        collisionMask: CollisionGroups.Default | CollisionGroups.Avatars
      })
      return () => {
        removeComponent(entity, RigidBodyComponent)
        removeComponent(entity, ColliderComponent)
      }
    }, [])

    useLayoutEffect(() => {
      const color = component.color.value
      if (mesh.material.color.value == color) return
      mesh.material.color.value.set(component.color.value)
    }, [component.color])

    useLayoutEffect(() => {
      const mat = getMaterial()
      mat.color.set(component.color.value)
      mesh.material.set(mat)
    }, [component.visible])

    return null
  }
})
