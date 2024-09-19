import {
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  getOptionalComponent,
  removeEntity,
  setComponent,
  UndefinedEntity
} from '@xrengine/ecs'
import assert from 'assert'
import { mockSpatialEngine } from '../../../tests/util/mockSpatialEngine'
import { destroySpatialEngine } from '../../initializeEngine'
import { TransformComponent } from '../RendererModule'
import { AnimateScaleComponent } from './AnimateScaleComponent'

type AnimateScaleComponentData = { multiplier: number }
const AnimateScaleComponentDefaults = {
  multiplier: 1.05
} as AnimateScaleComponentData

function assertAnimateScaleComponentEq(A: AnimateScaleComponentData, B: AnimateScaleComponentData): void {
  assert.equal(A.multiplier, B.multiplier)
}
function assertAnimateScaleComponentNotEq(A: AnimateScaleComponentData, B: AnimateScaleComponentData): void {
  assert.notEqual(A.multiplier, B.multiplier)
}

/** @todo When VR AnimateScaleComponent works correctly */
describe.skip('AnimateScaleComponent', () => {
  describe('IDs', () => {
    it('should initialize the AnimateScaleComponent.name field with the expected value', () => {
      assert.equal(AnimateScaleComponent.name, 'AnimateScaleComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, AnimateScaleComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, AnimateScaleComponent)
      assertAnimateScaleComponentEq(data, AnimateScaleComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, AnimateScaleComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroySpatialEngine()
      return destroyEngine()
    })

    it('should change the values of an initialized AnimateScaleComponent', () => {
      const Expected = 42
      const before = getOptionalComponent(testEntity, AnimateScaleComponent)
      assertAnimateScaleComponentEq(before!, AnimateScaleComponentDefaults)
      setComponent(testEntity, AnimateScaleComponent, { multiplier: Expected })
      const after = getComponent(testEntity, AnimateScaleComponent)
      assertAnimateScaleComponentNotEq(after, AnimateScaleComponentDefaults)
    })

    it('should not change values of an initialized AnimateScaleComponent when the data passed had incorrect types', () => {
      const Incorrect = 'incorrectValue'
      const before = getOptionalComponent(testEntity, AnimateScaleComponent)
      assertAnimateScaleComponentEq(before!, AnimateScaleComponentDefaults)
      // @ts-ignore Coerce incorrectly typed data into the component
      setComponent(testEntity, AnimateScaleComponent, { multiplier: Incorrect })
      const after = getComponent(testEntity, AnimateScaleComponent)
      assertAnimateScaleComponentEq(after, AnimateScaleComponentDefaults)
    })
  }) //:: onSet

  describe('reactor', () => {}) //:: reactor
})
