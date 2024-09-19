
import { createEntity, destroyEngine, getComponent, setComponent } from '@xrengine/ecs'
import { createEngine } from '@xrengine/ecs/src/Engine'
import assert from 'assert'
import { TransformComponent } from './TransformComponent'

describe('TransformComponent', () => {
  beforeEach(async () => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Creates a TransformComponent', () => {
    const entity = createEntity()

    setComponent(entity, TransformComponent)
    const transformComponent = getComponent(entity, TransformComponent)
    assert(TransformComponent.dirtyTransforms[entity])
    transformComponent.position.x = 12
    assert(transformComponent.position.x === TransformComponent.position.x[entity])
  })
})
