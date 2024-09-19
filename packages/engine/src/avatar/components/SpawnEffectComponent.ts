
import { Easing, Tween } from '@tweenjs/tween.js'
import { useEffect } from 'react'
import { AdditiveBlending, DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3 } from 'three'

import {
  defineComponent,
  getComponent,
  getMutableComponent,
  removeComponent,
  setComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { createEntity, removeEntity, useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { ObjectDirection, Vector3_Right, Vector3_Up } from '@xrengine/spatial/src/common/constants/MathConstants'
import { Physics, RaycastArgs } from '@xrengine/spatial/src/physics/classes/Physics'
import { AvatarCollisionMask, CollisionGroups } from '@xrengine/spatial/src/physics/enums/CollisionGroups'
import { getInteractionGroups } from '@xrengine/spatial/src/physics/functions/getInteractionGroups'
import { SceneQueryType } from '@xrengine/spatial/src/physics/types/PhysicsTypes'
import { addObjectToGroup } from '@xrengine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent, setVisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'
import { TweenComponent } from '@xrengine/spatial/src/transform/components/TweenComponent'

export const SpawnEffectComponent = defineComponent({
  name: 'SpawnEffectComponent',

  schema: S.Object({
    sourceEntity: S.Entity(),
    opacityMultiplier: S.Number(1),
    plateEntity: S.Entity(),
    lightEntities: S.Array(S.Entity())
  }),

  reactor: () => {
    const entity = useEntityContext()

    useEffect(() => {
      const effectComponent = getComponent(entity, SpawnEffectComponent)
      const sourceTransform = getComponent(effectComponent.sourceEntity, TransformComponent)
      /** Copy transform but do not attach to avatar */
      setComponent(entity, TransformComponent, { position: sourceTransform.position.clone() })
      const transform = getComponent(entity, TransformComponent)
      setComponent(entity, VisibleComponent, true)
      /** cast ray to move this downward to be on the ground */
      downwardGroundRaycast.origin.copy(sourceTransform.position)
      const physicsWorld = Physics.getWorld(entity)!
      const hits = Physics.castRay(physicsWorld, downwardGroundRaycast)
      if (hits.length) {
        transform.position.y = hits[0].position.y
      }

      createPlateEntity(entity)
      createRayEntities(entity)

      SpawnEffectComponent.fadeIn(entity)

      return () => {
        removeEntity(effectComponent.plateEntity!)
        for (const lightEntity of effectComponent.lightEntities!) {
          removeEntity(lightEntity)
        }
      }
    }, [])

    return null
  },

  fadeIn: (entity: Entity) => {
    const effectComponent = getComponent(entity, SpawnEffectComponent)
    setComponent(
      entity,
      TweenComponent,
      new Tween<any>(effectComponent)
        .to(
          {
            opacityMultiplier: 1
          },
          1000
        )
        .easing(Easing.Exponential.Out)
        .start()
        .onComplete(() => {
          removeComponent(entity, TweenComponent)
        })
    )
  },

  fadeOut: (entity: Entity) => {
    const effectComponent = getComponent(entity, SpawnEffectComponent)
    setComponent(
      entity,
      TweenComponent,
      new Tween<any>(effectComponent)
        .to(
          {
            opacityMultiplier: 0
          },
          2000
        )
        .start()
        .onComplete(() => {
          removeEntity(entity)
        })
    )
  },

  lightMesh: new Mesh(
    new PlaneGeometry(0.04, 3.2),
    new MeshBasicMaterial({
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide
    })
  ),

  plateMesh: new Mesh(
    new PlaneGeometry(1.6, 1.6),
    new MeshBasicMaterial({
      transparent: false,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
})

const createPlateEntity = (entity: Entity) => {
  const plateMesh = new Mesh(SpawnEffectComponent.plateMesh.geometry, SpawnEffectComponent.plateMesh.material)
  const plateEntity = createEntity()
  setComponent(plateEntity, NameComponent, 'Spawn Plate ' + entity)
  setComponent(plateEntity, EntityTreeComponent, { parentEntity: entity })
  addObjectToGroup(plateEntity, plateMesh)
  setVisibleComponent(plateEntity, true)
  const transform = getComponent(plateEntity, TransformComponent)
  transform.rotation.setFromAxisAngle(Vector3_Right, -0.5 * Math.PI)
  transform.position.y = 0.01
  getMutableComponent(entity, SpawnEffectComponent).plateEntity.set(plateEntity)
}

const createRayEntities = (entity: Entity) => {
  const R = 0.6 * SpawnEffectComponent.plateMesh.geometry.boundingSphere!.radius!
  const rayCount = 5 + 10 * R * Math.random()

  for (let i = 0; i < rayCount; i += 1) {
    const ray = SpawnEffectComponent.lightMesh.clone()

    const rayEntity = createEntity()
    setComponent(rayEntity, NameComponent, 'Spawn Ray ' + entity)
    setComponent(rayEntity, EntityTreeComponent, { parentEntity: entity })
    addObjectToGroup(rayEntity, ray)
    const transform = getComponent(rayEntity, TransformComponent)
    setVisibleComponent(rayEntity, true)
    getMutableComponent(entity, SpawnEffectComponent).lightEntities.merge([rayEntity])

    const a = (2 * Math.PI * i) / rayCount
    const r = R * Math.random()
    transform.position.x += r * Math.cos(a)
    transform.position.y += 0.5 * ray.geometry.boundingSphere!.radius! * Math.random()
    transform.position.z += r * Math.sin(a)

    transform.rotation.setFromAxisAngle(Vector3_Up, Math.random() * 2 * Math.PI)
  }
}

const downwardGroundRaycast = {
  type: SceneQueryType.Closest,
  origin: new Vector3(),
  direction: ObjectDirection.Down,
  maxDistance: 10,
  groups: getInteractionGroups(CollisionGroups.Avatars, AvatarCollisionMask)
} as RaycastArgs
