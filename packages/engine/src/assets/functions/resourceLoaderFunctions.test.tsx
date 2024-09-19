
import assert from 'assert'

import { createEntity, destroyEngine } from '@xrengine/ecs'
import { createEngine } from '@xrengine/ecs/src/Engine'
import { getState } from '@xrengine/hyperflux'
import {
  ResourceManager,
  ResourceState,
  ResourceStatus,
  ResourceType
} from '@xrengine/spatial/src/resources/ResourceState'

import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { overrideFileLoaderLoad } from '../../../tests/util/loadGLTFAssetNode'
import { GLTF } from '../loaders/gltf/GLTFLoader'
import { loadResource } from './resourceLoaderFunctions'

describe('resourceLoaderFunctions', () => {
  const url = '/packages/projects/default-project/assets/collisioncube.glb'

  overrideFileLoaderLoad()

  beforeEach(async () => {
    createEngine()
    loadEmptyScene()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Errors when resource is missing', (done) => {
    const entity = createEntity()
    const resourceState = getState(ResourceState)
    const controller = new AbortController()
    const nonExistingUrl = '/doesNotExist.glb'
    assert.doesNotThrow(() => {
      loadResource(
        nonExistingUrl,
        ResourceType.GLTF,
        entity,
        (response) => {
          assert(false)
        },
        (resquest) => {
          assert(false)
        },
        (error) => {
          assert(resourceState.resources[nonExistingUrl].status === ResourceStatus.Error)
          done()
        },
        controller.signal
      )
    }, done)
  })

  it('Loads asset', (done) => {
    const entity = createEntity()
    const resourceState = getState(ResourceState)
    const controller = new AbortController()
    assert.doesNotThrow(() => {
      loadResource<GLTF>(
        url,
        ResourceType.GLTF,
        entity,
        (response) => {
          assert(response.asset)
          assert(resourceState.resources[url].status === ResourceStatus.Loaded, 'Asset not loaded')

          done()
        },
        (resquest) => {},
        (error) => {
          assert(false)
        },
        controller.signal
      )
    }, done)
  })

  it('Removes asset', (done) => {
    const entity = createEntity()
    const resourceState = getState(ResourceState)
    const controller = new AbortController()
    assert.doesNotThrow(() => {
      loadResource<GLTF>(
        url,
        ResourceType.GLTF,
        entity,
        (response) => {
          ResourceManager.unload(url, entity)
          assert(resourceState.resources[url] === undefined, 'Asset not removed')

          done()
        },
        (resquest) => {},
        (error) => {
          assert(false)
        },
        controller.signal
      )
    }, done)
  })

  it('Loads asset once, but references twice', (done) => {
    const entity = createEntity()
    const entity2 = createEntity()
    const resourceState = getState(ResourceState)
    const controller = new AbortController()
    assert.doesNotThrow(() => {
      loadResource<GLTF>(
        url,
        ResourceType.GLTF,
        entity,
        (response) => {
          assert(resourceState.resources[url].references.length === 1, 'References not counted')
          assert(resourceState.resources[url].references.indexOf(entity) !== -1, 'Entity not referenced')

          loadResource<GLTF>(
            url,
            ResourceType.GLTF,
            entity2,
            (response) => {
              assert(response.asset)
              assert(resourceState.resources[url].references.length === 2, 'References not counted')
              assert(resourceState.resources[url].references.indexOf(entity) !== -1, 'Entity not referenced')
              assert(resourceState.resources[url].references.indexOf(entity) !== -1, 'Entity2 not referenced')
              ResourceManager.unload(url, entity)

              assert(resourceState.resources[url].references.length.valueOf() === 1, 'Entity reference not removed')
              assert(resourceState.resources[url].references.indexOf(entity) === -1)

              ResourceManager.unload(url, entity2)
              assert(resourceState.resources[url] === undefined, 'Asset not removed')

              done()
            },
            (resquest) => {},
            (error) => {
              assert(false)
            },
            controller.signal
          )
        },
        (resquest) => {},
        (error) => {
          assert(false)
        },
        controller.signal
      )
    }, done)
  })

  it('Counts references when entity is the same', (done) => {
    const entity = createEntity()
    const resourceState = getState(ResourceState)
    const controller = new AbortController()
    assert.doesNotThrow(() => {
      loadResource<GLTF>(
        url,
        ResourceType.GLTF,
        entity,
        (response) => {
          assert(resourceState.resources[url].references.length === 1, 'References not counted')
          assert(resourceState.resources[url].references.indexOf(entity) !== -1, 'Entity not referenced')

          loadResource<GLTF>(
            url,
            ResourceType.GLTF,
            entity,
            (response) => {
              assert(resourceState.resources[url].references.length === 2, 'References not counted')
              assert(resourceState.resources[url].references.indexOf(entity) !== -1, 'Entity not referenced')
              ResourceManager.unload(url, entity)

              assert(resourceState.resources[url].references.length.valueOf() === 1, 'Entity reference not removed')
              assert(resourceState.resources[url].references.indexOf(entity) !== -1)

              ResourceManager.unload(url, entity)
              assert(resourceState.resources[url] === undefined, 'Asset not removed')

              done()
            },
            (resquest) => {},
            (error) => {
              assert(false)
            },
            controller.signal
          )
        },
        (resquest) => {},
        (error) => {
          assert(false)
        },
        controller.signal
      )
    }, done)
  })

  it('Can load the same asset sequentially', (done) => {
    const entity = createEntity()
    const entity2 = createEntity()
    const resourceState = getState(ResourceState)
    const controller1 = new AbortController()
    const controller2 = new AbortController()
    let oneDone = false
    assert.doesNotThrow(() => {
      loadResource<GLTF>(
        url,
        ResourceType.GLTF,
        entity,
        (response) => {
          assert(resourceState.resources[url] !== undefined, 'Asset not found')
          ResourceManager.unload(url, entity)
          if (oneDone) done()
          else oneDone = true
        },
        (resquest) => {},
        (error) => {
          assert(false)
        },
        controller1.signal
      )
      loadResource<GLTF>(
        url,
        ResourceType.GLTF,
        entity2,
        (response) => {
          assert(resourceState.resources[url] !== undefined, 'Asset not found')
          ResourceManager.unload(url, entity2)
          if (oneDone) done()
          else oneDone = true
        },
        (resquest) => {},
        (error) => {
          assert(false)
        },
        controller2.signal
      )
    }, done)
  })

  it('Tracks assets referenced by GLTFs', (done) => {
    const entity = createEntity()
    const resourceState = getState(ResourceState)
    const controller = new AbortController()
    assert.doesNotThrow(() => {
      loadResource(
        url,
        ResourceType.GLTF,
        entity,
        (response) => {
          assert(resourceState.resources[url])
          assert(resourceState.resources[url].assetRefs?.Mesh.length === 2)
          const referencedMeshes = resourceState.resources[url].assetRefs.Mesh
          for (const refMesh of referencedMeshes) assert(resourceState.resources[refMesh])
          ResourceManager.unload(url, entity)
          assert(!resourceState.resources[url])
          done()
        },
        (resquest) => {
          assert(false)
        },
        (error) => {
          assert(false)
        },
        controller.signal
      )
    }, done)
  })
})
