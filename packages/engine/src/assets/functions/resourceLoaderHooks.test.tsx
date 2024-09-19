
import { act, render, renderHook } from '@testing-library/react'
import assert from 'assert'
import React, { useEffect } from 'react'

import { createEntity, destroyEngine } from '@xrengine/ecs'
import { createEngine } from '@xrengine/ecs/src/Engine'
import { getState, useHookstate } from '@xrengine/hyperflux'
import { ResourceState } from '@xrengine/spatial/src/resources/ResourceState'

import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { overrideFileLoaderLoad } from '../../../tests/util/loadGLTFAssetNode'
import { useGLTF, useTexture } from './resourceLoaderHooks'

describe('ResourceLoaderHooks', () => {
  const gltfURL = '/packages/projects/default-project/assets/collisioncube.glb'
  const gltfURL2 = '/packages/projects/default-project/assets/portal_frame.glb'
  const texURL = '/packages/projects/default-project/assets/drop-shadow.png'

  overrideFileLoaderLoad()

  beforeEach(async () => {
    createEngine()
    loadEmptyScene()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Renders hook', (done) => {
    const entity = createEntity()

    let gltfRender = 0

    const { result } = renderHook(() => {
      const [gltf, error] = useGLTF(gltfURL, entity)
      useEffect(() => {
        assert(!error)
        if (gltfRender > 0) {
          assert(gltf)
          done()
        }
        gltfRender += 1
      }, [gltf])

      return <></>
    })
  })

  it('Loads GLTF file', (done) => {
    const entity = createEntity()

    const Reactor = () => {
      const [gltf, error] = useGLTF(gltfURL, entity)

      useEffect(() => {
        assert(!error)
        if (gltf) {
          const resourceState = getState(ResourceState)
          assert(resourceState.resources[gltfURL])
          assert(resourceState.resources[gltfURL].references.includes(entity))
        }
      }, [gltf, error])

      return <></>
    }

    const { rerender, unmount } = render(<Reactor />)

    act(async () => {
      rerender(<Reactor />)
    }).then(() => {
      unmount()
      done()
    })
  })

  it('Loads Texture file', (done) => {
    const entity = createEntity()

    const Reactor = () => {
      const [texture, error] = useTexture(texURL, entity)

      useEffect(() => {
        assert(!error)
        if (texture) {
          const resourceState = getState(ResourceState)
          assert(resourceState.resources[texURL])
          assert(resourceState.resources[texURL].references.includes(entity))
        }
      }, [texture, error])

      return <></>
    }

    const { rerender, unmount } = render(<Reactor />)

    act(async () => {
      rerender(<Reactor />)
    }).then(() => {
      unmount()
      done()
    })
  })

  it('Unloads asset when component is unmounted', (done) => {
    const entity = createEntity()

    const Reactor = () => {
      const [_] = useGLTF(gltfURL, entity)

      return <></>
    }

    const { rerender, unmount } = render(<Reactor />)

    act(async () => {
      rerender(<Reactor />)
    }).then(() => {
      unmount()
      const resourceState = getState(ResourceState)
      assert(!resourceState.resources[gltfURL])
      done()
    })
  })

  it('Asset changes are reactive', (done) => {
    const entity = createEntity()

    let updatedCount = 0
    let lastID = 0
    const { result } = renderHook(() => {
      const url = useHookstate(gltfURL)
      const [gltf, error] = useGLTF(url.value, entity)
      useEffect(() => {
        assert(!error)
        if (updatedCount == 0) {
          assert(!gltf)
        } else if (updatedCount == 1) {
          assert(gltf)
          lastID = gltf.scene.id
          url.set(gltfURL2)
        } else if (updatedCount >= 2 && gltf) {
          assert(gltf.scene.id !== lastID)
          done()
        }
        updatedCount += 1
      }, [gltf])

      return <></>
    })
  })

  it('Errors correctly', (done) => {
    const entity = createEntity()
    const nonExistingUrl = '/doesNotExist.glb'

    let err: ErrorEvent | Error | null = null

    const Reactor = () => {
      const [gltf, error] = useGLTF(nonExistingUrl, entity)

      useEffect(() => {
        err = error
        assert(!gltf)
      }, [gltf, error])

      return <></>
    }

    const { rerender, unmount } = render(<Reactor />)

    act(async () => {
      rerender(<Reactor />)
    }).then(() => {
      assert(err)
      unmount()
      done()
    })
  })

  it('Unloads asset when source is change', (done) => {
    const entity = createEntity()
    let src = gltfURL

    const Reactor = () => {
      const [gltf, error] = useGLTF(src, entity)

      useEffect(() => {
        assert(!error)

        const resourceState = getState(ResourceState)
        if (src === gltfURL && gltf) {
          console.log('Model One Loaded')
          assert(resourceState.resources[gltfURL])
          assert(resourceState.resources[gltfURL].references.includes(entity))
          assert(!resourceState.resources[gltfURL2])
        } else if (src === gltfURL2 && gltf) {
          console.log('Model Two Loaded')
          assert(resourceState.resources[gltfURL2])
          assert(resourceState.resources[gltfURL2].references.includes(entity))
          assert(!resourceState.resources[gltfURL])
        }
      }, [gltf, error])

      return <></>
    }

    const { rerender, unmount } = render(<Reactor />)

    act(async () => {
      rerender(<Reactor />)
    }).then(() => {
      act(async () => {
        src = gltfURL2
        rerender(<Reactor />)
      }).then(() => {
        unmount()
        done()
      })
    })
  })

  it('useGLTF calls loadResource synchronously', () => {
    const resourceState = getState(ResourceState)
    const entity = createEntity()
    // use renderHook to render the hook
    renderHook(() => {
      // call the useGLTF hook
      useGLTF(gltfURL, entity)
    })
    // ensure that the loadResource function is synchronously called when the hook is rendered
    assert(resourceState.resources[gltfURL])
  })
})
