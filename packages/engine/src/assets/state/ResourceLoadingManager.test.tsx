
import assert from 'assert'
import { LoadingManager } from 'three'

import { createEntity, destroyEngine } from '@xrengine/ecs'
import { createEngine } from '@xrengine/ecs/src/Engine'
import { getState } from '@xrengine/hyperflux'
import { ResourceState, ResourceType } from '@xrengine/spatial/src/resources/ResourceState'

import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { loadResource } from '../functions/resourceLoaderFunctions'
import { ResourceLoadingManager } from '../loaders/base/ResourceLoadingManager'
import { GLTF } from '../loaders/gltf/GLTFLoader'
import { setDefaultLoadingManager } from './ResourceLoadingManagerState'

describe('ResourceLoadingManager', () => {
  const url = '/packages/projects/default-project/assets/collisioncube.glb'

  beforeEach(async () => {
    createEngine()
    loadEmptyScene()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Calls loading manager', (done) => {
    const entity = createEntity()
    const resourceState = getState(ResourceState)
    const controller = new AbortController()
    assert.doesNotThrow(() => {
      setDefaultLoadingManager(
        new ResourceLoadingManager((startUrl) => {
          assert(startUrl === url)
          assert(resourceState.resources[url] !== undefined, 'Asset not added to resource manager')
          done()
          setDefaultLoadingManager()
        }) as LoadingManager
      )

      loadResource<GLTF>(
        url,
        ResourceType.GLTF,
        entity,
        (response) => {},
        (resquest) => {},
        (error) => {
          assert(false)
        },
        controller.signal
      )
    }, done)
  })
})
