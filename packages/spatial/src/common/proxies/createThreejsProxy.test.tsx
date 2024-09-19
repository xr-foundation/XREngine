
import { createEntity, defineComponent, destroyEngine, getComponent, setComponent } from '@xrengine/ecs'
import { createEngine } from '@xrengine/ecs/src/Engine'
import { ECSSchema } from '@xrengine/ecs/src/schemas/ECSSchemas'
import assert from 'assert'
import { Matrix4 } from 'three'
import { Mat4Proxy, Vec3Proxy } from './createThreejsProxy'

describe('createThreejsProxy', () => {
  beforeEach(async () => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Creates a Vec3 proxy', () => {
    const TransformComponent = defineComponent({
      name: 'Vector3Component',
      schema: {
        position: ECSSchema.Vec3,
        matrix: ECSSchema.Mat4
      }
    })

    const entity = createEntity()
    setComponent(entity, TransformComponent)
    const transformComponent = getComponent(entity, TransformComponent)
    const vec3 = Vec3Proxy(transformComponent.position)

    vec3.x = 12
    assert(vec3.x === 12)
    assert(transformComponent.position.x === 12)
    assert(TransformComponent.position.x[entity] === 12)

    transformComponent.position.x = 13
    assert((vec3.x as number) === 13)
    assert((transformComponent.position.x as number) === 13)
    assert((TransformComponent.position.x[entity] as number) === 13)

    TransformComponent.position.x[entity] = 14
    assert((vec3.x as number) === 14)
    assert((transformComponent.position.x as number) === 14)
    assert((TransformComponent.position.x[entity] as number) === 14)
  })

  it('Creates a Mat4 proxy', () => {
    const TransformComponent = defineComponent({
      name: 'Vector3Component',
      schema: {
        position: ECSSchema.Vec3,
        matrix: ECSSchema.Mat4
      }
    })

    const entity = createEntity()
    setComponent(entity, TransformComponent)
    const transformComponent = getComponent(entity, TransformComponent)
    const mat4 = Mat4Proxy(transformComponent.matrix)

    const mat4Elements = new Matrix4().elements
    transformComponent.matrix.set(mat4Elements)

    for (let i = 0; i < mat4Elements.length; i++) {
      assert(transformComponent.matrix[i] === mat4Elements[i])
      assert(TransformComponent.matrix[entity][i] === mat4Elements[i])
      assert(mat4.elements[i] === mat4Elements[i])
    }

    mat4.elements[12] = 34
    assert(transformComponent.matrix[12] === 34)
    assert(TransformComponent.matrix[entity][12] === 34)
    assert(mat4.elements[12] === 34)

    transformComponent.matrix[13] = 35
    assert(transformComponent.matrix[13] === 35)
    assert(TransformComponent.matrix[entity][13] === 35)
    assert(mat4.elements[13] === 35)

    TransformComponent.matrix[entity][14] = 36
    assert(transformComponent.matrix[14] === 36)
    assert(TransformComponent.matrix[entity][14] === 36)
    assert(mat4.elements[14] === 36)
  })
})
