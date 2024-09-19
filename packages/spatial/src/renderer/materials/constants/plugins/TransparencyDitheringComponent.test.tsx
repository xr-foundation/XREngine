import {
  EntityUUID,
  UndefinedEntity,
  createEngine,
  createEntity,
  createInitialComponentValue,
  destroyEngine,
  getComponent,
  hasComponent,
  removeEntity,
  setComponent
} from '@xrengine/ecs'
import assert from 'assert'
import { Material, Uniform } from 'three'
import { assertArrayEqual } from '../../../../physics/components/RigidBodyComponent.test'
import { MaterialStateComponent } from '../../MaterialComponent'
import {
  TransparencyDitheringPluginComponent,
  TransparencyDitheringRootComponent
} from './TransparencyDitheringComponent'

type TransparencyDitheringRootComponentData = {
  materials: EntityUUID[]
}
const TransparencyDitheringRootComponentDefaults: TransparencyDitheringRootComponentData = {
  materials: [] as EntityUUID[]
}

function assertTransparencyDitheringRootComponentEq(
  A: TransparencyDitheringRootComponentData,
  B: TransparencyDitheringRootComponentData
): void {
  assertArrayEqual(A.materials, B.materials)
}

describe('TransparencyDitheringRootComponent', () => {
  describe('IDs', () => {
    it('should initialize the TransparencyDitheringRootComponent.name field with the expected value', () => {
      assert.equal(TransparencyDitheringRootComponent.name, 'TransparencyDitheringRootComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransparencyDitheringRootComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, TransparencyDitheringRootComponent)
      assertTransparencyDitheringRootComponentEq(data, TransparencyDitheringRootComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })
  }) //:: onSet
})

type TransparencyDitheringPluginComponentData = {
  centers: Uniform
  exponents: Uniform
  distances: Uniform
  useWorldCalculation: Uniform
}

const TransparencyDitheringPluginComponentDefaults: TransparencyDitheringPluginComponentData =
  createInitialComponentValue(UndefinedEntity, TransparencyDitheringPluginComponent)

function assertTransparencyDitheringPluginComponentEq(
  A: TransparencyDitheringPluginComponentData,
  B: TransparencyDitheringPluginComponentData
): void {
  assert.deepEqual(A.centers, B.centers)
  assert.deepEqual(A.exponents, B.exponents)
  assert.deepEqual(A.distances, B.distances)
  assert.deepEqual(A.useWorldCalculation, B.useWorldCalculation)
}

describe('TransparencyDitheringPluginComponent', () => {
  describe('IDs', () => {
    it('should initialize the TransparencyDitheringPluginComponent.name field with the expected value', () => {
      assert.equal(TransparencyDitheringPluginComponent.name, 'TransparencyDitheringPluginComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransparencyDitheringPluginComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, TransparencyDitheringPluginComponent)
      assertTransparencyDitheringPluginComponentEq(data, TransparencyDitheringPluginComponentDefaults)
    })
  }) //:: onInit

  describe('reactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should set call `setPlugin` on the MaterialStateComponent.material of the entityContext', () => {
      const material = new Material()
      // Set the data as expected
      setComponent(testEntity, MaterialStateComponent, { material: material })
      // Sanity check before running
      assert.equal(getComponent(testEntity, MaterialStateComponent).material.plugins, undefined)
      // Run and Check the result
      setComponent(testEntity, TransparencyDitheringPluginComponent)
      assert.notEqual(getComponent(testEntity, MaterialStateComponent).material.plugins, undefined)
    })

    it('should not do anything if the entityContext does not have a MaterialStateComponent', () => {
      // Sanity check before running
      assert.equal(hasComponent(testEntity, MaterialStateComponent), false)
      // Run and Check the result
      setComponent(testEntity, TransparencyDitheringPluginComponent)
      assert.equal(hasComponent(testEntity, MaterialStateComponent), false)
    })
  }) //:: reactor
})
