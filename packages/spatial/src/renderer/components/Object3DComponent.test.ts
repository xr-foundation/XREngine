import {
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  removeEntity,
  setComponent,
  UndefinedEntity
} from '@xrengine/ecs'
import assert from 'assert'
import { BoxGeometry, Mesh, Object3D } from 'three'
import { NameComponent } from '../../common/NameComponent'
import { Object3DComponent } from './Object3DComponent'

const Object3DComponentDefaults = null! as Object3D

function assertObject3DComponentEq(A: Object3D, B: Object3D) {
  assert.equal(Boolean(A), Boolean(B))
  assert.equal(A.isObject3D, B.isObject3D)
  assert.equal(A.uuid, B.uuid)
}

describe('Object3DComponent', () => {
  describe('IDs', () => {
    it('should initialize the Object3DComponent.name field with the expected value', () => {
      assert.equal(Object3DComponent.name, 'Object3DComponent')
    })

    it('should initialize the Object3DComponent.jsonID field with the expected value', () => {
      assert.equal(Object3DComponent.jsonID, 'XRENGINE_object3d')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const Expected = new Mesh(new BoxGeometry())
      setComponent(testEntity, Object3DComponent, Expected)
      const data = getComponent(testEntity, Object3DComponent)
      assertObject3DComponentEq(data, Expected)
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

    it('should throw an error if the data assigned does not provide a valid `Object3D` object', () => {
      assert.throws(() => setComponent(testEntity, Object3DComponent))
    })

    it('should not throw an error if the data assigned provides a valid `Object3D` object', () => {
      assert.doesNotThrow(() => setComponent(testEntity, Object3DComponent, new Mesh(new BoxGeometry())))
    })

    it('should change the values of an initialized Object3DComponent', () => {
      setComponent(testEntity, Object3DComponent, new Mesh(new BoxGeometry()))
      const before = getComponent(testEntity, Object3DComponent).uuid
      setComponent(testEntity, Object3DComponent, new Mesh(new BoxGeometry()))
      const after = getComponent(testEntity, Object3DComponent).uuid
      assert.notEqual(before, after)
    })

    it("should set the object3d.name to the value of the entity's NameComponent when the entity has one", () => {
      const Expected = 'testEntity'
      setComponent(testEntity, NameComponent, Expected)
      setComponent(testEntity, Object3DComponent, new Mesh(new BoxGeometry()))
      assert.equal(getComponent(testEntity, Object3DComponent).name, Expected)
    })

    it("should not set the object3d.name when the entity doesn't have a NameComponent", () => {
      setComponent(testEntity, Object3DComponent, new Mesh(new BoxGeometry()))
      const result = getComponent(testEntity, Object3DComponent).name
      assert.equal(result, '')
    })
  }) //:: onSet

  /** @todo This component should have a reactor that updates the name of the object when a NameComponent is set on the entity after its Object3DComponent is set? */
})
