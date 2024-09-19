import {
  createEngine,
  createEntity,
  defineQuery,
  destroyEngine,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent,
  removeEntity,
  setComponent,
  UndefinedEntity
} from '@xrengine/ecs'
import { getMutableState, getState } from '@xrengine/hyperflux'
import assert from 'assert'
import { Color, ColorRepresentation, ShaderMaterial } from 'three'
import { NameComponent } from '../../common/NameComponent'
import { assertFloatApproxEq, assertFloatApproxNotEq } from '../../physics/classes/Physics.test'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { RendererState } from '../RendererState'
import { createInfiniteGridHelper, InfiniteGridComponent } from './InfiniteGridHelper'
import { LineSegmentComponent } from './LineSegmentComponent'
import { MeshComponent } from './MeshComponent'
import { VisibleComponent } from './VisibleComponent'

type InfiniteGridComponentData = {
  size: number
  color: ColorRepresentation
  distance: number
}

const InfiniteGridComponentDefaults = {
  size: 1,
  color: new Color(0x535353),
  distance: 200
} as InfiniteGridComponentData

function assertInfiniteGridComponentEq(A: InfiniteGridComponentData, B: InfiniteGridComponentData) {
  assert.equal(A.size, B.size)
  const leftColor = new Color(A.color)
  const rightColor = new Color(B.color)
  assertFloatApproxEq(leftColor.r, rightColor.r)
  assertFloatApproxEq(leftColor.g, rightColor.g)
  assertFloatApproxEq(leftColor.b, rightColor.b)
  assert.equal(A.distance, B.distance)
}

function assertInfiniteGridComponentNotEq(A: InfiniteGridComponentData, B: InfiniteGridComponentData) {
  assert.notEqual(A.size, B.size)
  const leftColor = new Color(A.color)
  const rightColor = new Color(B.color)
  assertFloatApproxNotEq(leftColor.r, rightColor.r)
  assertFloatApproxNotEq(leftColor.g, rightColor.g)
  assertFloatApproxNotEq(leftColor.b, rightColor.b)
  assert.notEqual(A.distance, B.distance)
}

describe('InfiniteGridComponent', () => {
  describe('IDs', () => {
    it('should initialize the InfiniteGridComponent.name field with the expected value', () => {
      assert.equal(InfiniteGridComponent.name, 'InfiniteGridComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, InfiniteGridComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, InfiniteGridComponent)
      assertInfiniteGridComponentEq(data, InfiniteGridComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, InfiniteGridComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should change the values of an initialized InfiniteGridComponent', () => {
      const Expected = {
        size: 42,
        color: new Color(0x123456),
        distance: 10_000
      }
      const data = getComponent(testEntity, InfiniteGridComponent)
      assertInfiniteGridComponentEq(data, InfiniteGridComponentDefaults)
      setComponent(testEntity, InfiniteGridComponent, Expected)
      assertInfiniteGridComponentNotEq(data, InfiniteGridComponentDefaults)
      assertInfiniteGridComponentEq(data, Expected)
    })
  }) //:: onSet

  describe('reactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, InfiniteGridComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should trigger when engineRendererSettings.gridHeight changes', () => {
      const Expected = 42
      const gridHeightBefore = getState(RendererState).gridHeight
      getMutableState(RendererState).gridHeight.set(Expected)
      const gridHeightAfter = getState(RendererState).gridHeight
      assert.notEqual(gridHeightBefore, gridHeightAfter)
      // Run and Check the result
      InfiniteGridComponent.reactorMap.get(testEntity)!.run() // Reactor is already running. But force-run it so changes are applied immediately
      assert.equal(getComponent(testEntity, MeshComponent).position.y, Expected)
    })

    it('should trigger when component.color changes', () => {
      const Expected = new Color(0xffffff)
      assert.notDeepEqual(getComponent(testEntity, InfiniteGridComponent).color, Expected)
      getMutableComponent(testEntity, InfiniteGridComponent).color.set(Expected)
      assert.deepEqual(getComponent(testEntity, InfiniteGridComponent).color, Expected)
      // Run and Check the result
      InfiniteGridComponent.reactorMap.get(testEntity)!.run() // Reactor is already running. But force-run it so changes are applied immediately
      const result = getComponent(testEntity, MeshComponent).material as ShaderMaterial
      assert.equal(result.uniforms.uColor.value, Expected)
    })

    it('should trigger when component.size changes', () => {
      const Expected = 42
      assert.notEqual(getComponent(testEntity, InfiniteGridComponent).size, Expected)
      getMutableComponent(testEntity, InfiniteGridComponent).size.set(Expected)
      assert.equal(getComponent(testEntity, InfiniteGridComponent).size, Expected)
      // Run and Check the result
      InfiniteGridComponent.reactorMap.get(testEntity)!.run() // Reactor is already running. But force-run it so changes are applied immediately
      const result = getComponent(testEntity, MeshComponent).material as ShaderMaterial
      assert.equal(result.uniforms.uSize1.value, Expected)
      assert.equal(result.uniforms.uSize2.value, Expected * 10)
    })

    describe('when distance changes ...', () => {
      it("... should change the uniforms.uDistance value for the Mesh's ShaderMaterial", () => {
        const Expected = 42
        assert.notEqual(getComponent(testEntity, InfiniteGridComponent).distance, Expected)
        getMutableComponent(testEntity, InfiniteGridComponent).distance.set(Expected)
        assert.equal(getComponent(testEntity, InfiniteGridComponent).distance, Expected)
        // Run and Check the result
        InfiniteGridComponent.reactorMap.get(testEntity)!.run() // Reactor is already running. But force-run it so changes are applied immediately
        const result = getComponent(testEntity, MeshComponent).material as ShaderMaterial
        assert.equal(result.uniforms.uDistance.value, Expected)
      })

      const LineColors = ['red', 'green', 'blue'] // duplicate of the lineColors array inside the component.distance useEffect
      const LineQuery = defineQuery([LineSegmentComponent])
      it('... should create, for every line color, an entity that has a LineSegmentComponent with name `infinite-grid-helper-line-${i}`', () => {
        const Names = ['infinite-grid-helper-line-0', 'infinite-grid-helper-line-1', 'infinite-grid-helper-line-2']
        assert.equal(LineQuery().length, LineColors.length)
        for (const entity of LineQuery()) {
          assert.equal(Names.includes(getComponent(entity, LineSegmentComponent).name), true)
        }
      })

      it('... should create, for every line color, an entity that has an EntityTreeComponent whose parent should be the entityContext', () => {
        assert.equal(LineQuery().length, LineColors.length)
        for (const entity of LineQuery()) {
          assert.equal(getComponent(entity, EntityTreeComponent).parentEntity, testEntity)
        }
      })

      it('... should remove all lineEntities of the grid when the InfiniteGridComponent is removed from the entity', () => {
        assert.equal(LineQuery().length, LineColors.length)
        removeComponent(testEntity, InfiniteGridComponent)
        assert.equal(LineQuery().length, 0)
      })
    })
  }) //:: reactor
})

describe('createInfiniteGridHelper', () => {
  beforeEach(async () => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should return a valid entity', () => {
    const result = createInfiniteGridHelper()
    assert.notEqual(result, UndefinedEntity)
  })

  it('should assign an EntityTreeComponent to the returned entity', () => {
    const result = createInfiniteGridHelper()
    assert.equal(hasComponent(result, EntityTreeComponent), true)
  })

  it('should assign an InfiniteGridComponent to the returned entity', () => {
    const result = createInfiniteGridHelper()
    assert.equal(hasComponent(result, InfiniteGridComponent), true)
  })

  it("should assign a NameComponent to the returned entity, with a value of 'Infinite Grid Helper'", () => {
    const result = createInfiniteGridHelper()
    assert.equal(hasComponent(result, NameComponent), true)
    assert.equal(getComponent(result, NameComponent), 'Infinite Grid Helper')
  })

  it('should assign a VisibleComponent to the returned entity, with a value of `true`', () => {
    const result = createInfiniteGridHelper()
    assert.equal(hasComponent(result, VisibleComponent), true)
  })
})
