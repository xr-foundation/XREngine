
import { defineComponent, useComponent, useEntityContext, useOptionalComponent } from '@xrengine/ecs'
import { useState } from '@xrengine/hyperflux'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { useLayoutEffect } from 'react'
import { useAncestorWithComponents } from '../../transform/components/EntityTree'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Physics } from '../classes/Physics'
import { CollisionGroups, DefaultCollisionMask } from '../enums/CollisionGroups'
import { ShapeSchema, Shapes } from '../types/PhysicsTypes'
import { RigidBodyComponent } from './RigidBodyComponent'
import { TriggerComponent } from './TriggerComponent'

export const ColliderComponent = defineComponent({
  name: 'ColliderComponent',
  jsonID: 'XRENGINE_collider',

  schema: S.Object({
    shape: ShapeSchema('box'),
    mass: S.Number(1),
    massCenter: S.Vec3(),
    friction: S.Number(0.5),
    restitution: S.Number(0.5),
    collisionLayer: S.Enum(CollisionGroups, CollisionGroups.Default),
    collisionMask: S.Number(DefaultCollisionMask)
  }),

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, ColliderComponent)
    const transform = useComponent(entity, TransformComponent)
    const rigidbodyEntity = useAncestorWithComponents(entity, [RigidBodyComponent])
    const rigidbodyComponent = useOptionalComponent(rigidbodyEntity, RigidBodyComponent)
    const physicsWorld = Physics.useWorld(entity)
    const triggerComponent = useOptionalComponent(entity, TriggerComponent)
    const hasCollider = useState(false)

    useLayoutEffect(() => {
      if (!rigidbodyComponent?.initialized?.value || !physicsWorld) return

      const colliderDesc = Physics.createColliderDesc(physicsWorld, entity, rigidbodyEntity)

      if (!colliderDesc) return

      Physics.attachCollider(physicsWorld, colliderDesc, rigidbodyEntity, entity)
      hasCollider.set(true)

      return () => {
        Physics.removeCollider(physicsWorld, entity)
        hasCollider.set(false)
      }
    }, [physicsWorld, component.shape, !!rigidbodyComponent?.initialized?.value, transform.scale])

    useLayoutEffect(() => {
      if (!physicsWorld) return
      Physics.setMass(physicsWorld, entity, component.mass.value)
    }, [physicsWorld, component.mass])

    // useLayoutEffect(() => {
    // @todo
    // }, [physicsWorld, component.massCenter])

    useLayoutEffect(() => {
      if (!physicsWorld) return
      Physics.setFriction(physicsWorld, entity, component.friction.value)
    }, [physicsWorld, component.friction])

    useLayoutEffect(() => {
      if (!physicsWorld) return
      Physics.setRestitution(physicsWorld, entity, component.restitution.value)
    }, [physicsWorld, component.restitution])

    useLayoutEffect(() => {
      if (!physicsWorld) return
      Physics.setCollisionLayer(physicsWorld, entity, component.collisionLayer.value)
    }, [physicsWorld, component.collisionLayer])

    useLayoutEffect(() => {
      if (!physicsWorld) return
      Physics.setCollisionMask(physicsWorld, entity, component.collisionMask.value)
    }, [physicsWorld, component.collisionMask])

    useLayoutEffect(() => {
      if (!physicsWorld || !triggerComponent?.value || !hasCollider.value) return

      Physics.setTrigger(physicsWorld, entity, true)

      return () => {
        Physics.setTrigger(physicsWorld, entity, false)
      }
    }, [physicsWorld, triggerComponent, hasCollider])

    return null
  }
})

export const supportedColliderShapes = [
  Shapes.Sphere,
  Shapes.Capsule,
  Shapes.Cylinder,
  Shapes.Box,
  // Shapes.ConvexHull,
  Shapes.Mesh
  // Shapes.Heightfield
]
