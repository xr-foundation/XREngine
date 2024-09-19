import { Not } from 'bitecs'
import { useEffect } from 'react'

import { getComponent, removeComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { ECSState } from '@xrengine/ecs/src/ECSState'
import { Entity } from '@xrengine/ecs/src/Entity'
import { QueryReactor, defineQuery, useQuery } from '@xrengine/ecs/src/QueryFunctions'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { SimulationSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { getMutableState, getState, none, useHookstate } from '@xrengine/hyperflux'
import { NetworkState } from '@xrengine/network'

import { UUIDComponent, useEntityContext } from '@xrengine/ecs'
import React from 'react'
import { SceneComponent } from '../../renderer/components/SceneComponents'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { PhysicsSerialization } from '../PhysicsSerialization'
import { Physics } from '../classes/Physics'
import { CollisionComponent } from '../components/CollisionComponent'
import {
  RigidBodyComponent,
  RigidBodyFixedTagComponent,
  RigidBodyKinematicTagComponent
} from '../components/RigidBodyComponent'
import { ColliderHitEvent, CollisionEvents } from '../types/PhysicsTypes'

const nonFixedRigidbodyQuery = defineQuery([RigidBodyComponent, Not(RigidBodyFixedTagComponent)])
const collisionQuery = defineQuery([CollisionComponent])

const kinematicQuery = defineQuery([RigidBodyComponent, RigidBodyKinematicTagComponent, TransformComponent])

const execute = () => {
  const existingColliderHits = [] as Array<{ entity: Entity; collisionEntity: Entity; hit: ColliderHitEvent }>

  for (const collisionEntity of collisionQuery()) {
    const collisionComponent = getComponent(collisionEntity, CollisionComponent)
    for (const [entity, hit] of collisionComponent) {
      if (hit.type !== CollisionEvents.COLLISION_PERSIST && hit.type !== CollisionEvents.TRIGGER_PERSIST) {
        existingColliderHits.push({ entity, collisionEntity, hit })
      }
    }
  }

  const allRigidBodies = nonFixedRigidbodyQuery()
  Physics.updatePreviousRigidbodyPose(allRigidBodies)
  const { simulationTimestep } = getState(ECSState)
  const kinematicEntities = kinematicQuery()
  Physics.simulate(simulationTimestep, kinematicEntities)
  Physics.updateRigidbodyPose(allRigidBodies)

  /** process collisions */
  for (const { entity, collisionEntity, hit } of existingColliderHits) {
    const collisionComponent = getComponent(collisionEntity, CollisionComponent)
    if (!collisionComponent) continue
    const newHit = collisionComponent.get(entity)!
    if (!newHit) continue
    if (hit.type === CollisionEvents.COLLISION_START && newHit.type === CollisionEvents.COLLISION_START) {
      newHit.type = CollisionEvents.COLLISION_PERSIST
    }
    if (hit.type === CollisionEvents.TRIGGER_START && newHit.type === CollisionEvents.TRIGGER_START) {
      newHit.type = CollisionEvents.TRIGGER_PERSIST
    }
    if (hit.type === CollisionEvents.COLLISION_END && newHit.type === CollisionEvents.COLLISION_END) {
      collisionComponent.delete(entity)
    }
    if (hit.type === CollisionEvents.TRIGGER_END && newHit.type === CollisionEvents.TRIGGER_END) {
      collisionComponent.delete(entity)
    }
  }

  for (const collisionEntity of collisionQuery()) {
    const collisionComponent = getComponent(collisionEntity, CollisionComponent)
    if (!collisionComponent.size) {
      removeComponent(collisionEntity, CollisionComponent)
    }
  }
}

const PhysicsSceneReactor = () => {
  const entity = useEntityContext()
  const uuid = useComponent(entity, UUIDComponent).value
  useEffect(() => {
    Physics.createWorld(uuid)
    return () => {
      Physics.destroyWorld(uuid)
    }
  }, [uuid])
  return null
}

const reactor = () => {
  const physicsLoaded = useHookstate(false)
  const physicsLoadPending = useHookstate(false)
  const physicsQuery = useQuery([SceneComponent])

  useEffect(() => {
    const networkState = getMutableState(NetworkState)

    networkState.networkSchema[PhysicsSerialization.ID].set({
      read: PhysicsSerialization.readRigidBody,
      write: PhysicsSerialization.writeRigidBody
    })

    return () => {
      networkState.networkSchema[PhysicsSerialization.ID].set(none)
    }
  }, [])

  useEffect(() => {
    if (physicsLoaded.value || physicsLoadPending.value) return
    if (physicsQuery.length) {
      physicsLoadPending.set(true)
      Physics.load().then(() => {
        physicsLoaded.set(true)
      })
    }
  }, [physicsQuery])

  if (!physicsLoaded.value) return null

  return (
    <>
      <QueryReactor Components={[SceneComponent]} ChildEntityReactor={PhysicsSceneReactor} />
    </>
  )
}

export const PhysicsSystem = defineSystem({
  uuid: 'xrengine.engine.PhysicsSystem',
  insert: { with: SimulationSystemGroup },
  execute,
  reactor
})
