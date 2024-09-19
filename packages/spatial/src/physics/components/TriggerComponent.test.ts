
import {
  EntityUUID,
  UUIDComponent,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  removeComponent,
  removeEntity,
  serializeComponent,
  setComponent
} from '@xrengine/ecs'
import assert from 'assert'
import { Vector3 } from 'three'
import { TransformComponent } from '../../SpatialModule'
import { SceneComponent } from '../../renderer/components/SceneComponents'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { Physics, PhysicsWorld } from '../classes/Physics'
import { CollisionGroups, DefaultCollisionMask } from '../enums/CollisionGroups'
import { Shapes } from '../types/PhysicsTypes'
import { ColliderComponent } from './ColliderComponent'
import { ColliderComponentDefaults, assertColliderComponentEquals } from './ColliderComponent.test'
import { RigidBodyComponent } from './RigidBodyComponent'
import { TriggerComponent } from './TriggerComponent'

const TriggerComponentDefaults = {
  triggers: [] as Array<{
    onEnter: null | string
    onExit: null | string
    target: null | EntityUUID
  }>
}

function assertArrayEqual<T>(A: Array<T>, B: Array<T>, err = 'Arrays are not equal') {
  assert.equal(A.length, B.length, err)
  for (let id = 0; id < A.length && id < B.length; id++) {
    assert.deepEqual(A[id], B[id], err)
  }
}

function assertArrayNotEqual<T>(A: Array<T>, B: Array<T>, err = 'Arrays are equal') {
  for (let id = 0; id < A.length && id < B.length; id++) {
    assert.notDeepEqual(A[id], B[id], err)
  }
}

function assertTriggerComponentEqual(data, expected) {
  assertArrayEqual(data.triggers, expected.triggers)
}

function assertTriggerComponentNotEqual(data, expected) {
  assertArrayNotEqual(data.triggers, expected.triggers)
}

describe('TriggerComponent', () => {
  describe('IDs', () => {
    it('should initialize the TriggerComponent.name field with the expected value', () => {
      assert.equal(TriggerComponent.name, 'TriggerComponent')
    })
    it('should initialize the TriggerComponent.jsonID field with the expected value', () => {
      assert.equal(TriggerComponent.jsonID, 'XRENGINE_trigger')
    })
  })

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TriggerComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, TriggerComponent)
      assertTriggerComponentEqual(data, TriggerComponentDefaults)
    })
  }) // << onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TriggerComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should change the values of an initialized TriggerComponent', () => {
      const Expected = {
        triggers: [
          {
            onEnter: 'onEnter.Expected',
            onExit: 'onExit.Expected',
            target: 'target' as EntityUUID
          }
        ]
      }
      const before = getComponent(testEntity, TriggerComponent)
      assertTriggerComponentEqual(before, TriggerComponentDefaults)
      setComponent(testEntity, TriggerComponent, Expected)

      const data = getComponent(testEntity, TriggerComponent)
      assertTriggerComponentEqual(data, Expected)
    })
  }) // << onSet

  describe('toJSON', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      await Physics.load()
      testEntity = createEntity()
      setComponent(testEntity, TriggerComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it("should serialize the component's data correctly", () => {
      const json = serializeComponent(testEntity, TriggerComponent)
      assert.deepEqual(json, TriggerComponentDefaults)
    })
  }) // << toJson

  describe('reactor', () => {
    let testEntity = UndefinedEntity
    let physicsWorld: PhysicsWorld
    let physicsWorldEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      await Physics.load()
      physicsWorldEntity = createEntity()
      setComponent(physicsWorldEntity, UUIDComponent, UUIDComponent.generateUUID())
      setComponent(physicsWorldEntity, SceneComponent)
      setComponent(physicsWorldEntity, TransformComponent)
      setComponent(physicsWorldEntity, EntityTreeComponent)
      physicsWorld = Physics.createWorld(getComponent(physicsWorldEntity, UUIDComponent))
      physicsWorld!.timestep = 1 / 60

      testEntity = createEntity()
      setComponent(testEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, RigidBodyComponent)
      setComponent(testEntity, ColliderComponent)
      setComponent(testEntity, TriggerComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it("should call Physics.setTrigger on the entity's collider when a new ColliderComponent is set", () => {
      assertColliderComponentEquals(getComponent(testEntity, ColliderComponent), ColliderComponentDefaults)
      removeComponent(testEntity, ColliderComponent)
      const ColliderComponentData = {
        shape: Shapes.Sphere,
        mass: 3,
        massCenter: new Vector3(1, 2, 3),
        friction: 1.0,
        restitution: 0.1,
        collisionLayer: CollisionGroups.Default,
        collisionMask: DefaultCollisionMask
      }
      setComponent(testEntity, ColliderComponent, ColliderComponentData)
      assertColliderComponentEquals(getComponent(testEntity, ColliderComponent), ColliderComponentData)
      const reactor = ColliderComponent.reactorMap.get(testEntity)!
      assert.ok(reactor.isRunning)
      const collider = physicsWorld.Colliders.get(testEntity)!
      assert.ok(collider)
      assert.ok(collider.isSensor())
    })
  }) // << reactor
})
