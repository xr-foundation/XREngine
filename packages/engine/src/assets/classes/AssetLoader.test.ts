
import assert from 'assert'
import Sinon from 'sinon'

// hack to make tests happy
import '../../EngineModule'

import { createEngine, destroyEngine } from '@xrengine/ecs/src/Engine'

import { AssetExt, AssetType } from '@xrengine/engine/src/assets/constants/AssetType'
import { ABSOLUTE_URL_PROTOCOL_REGEX, AssetLoader } from './AssetLoader'

/**
 * tests
 */
describe('AssetLoader', async () => {
  beforeEach(async () => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('getAssetType', () => {
    it('should work for gltf asset', async () => {
      const url = 'www.test.com/file.gltf'
      const type = AssetLoader.getAssetType(url)
      assert.equal(type, AssetExt.GLTF)
    })

    it('should work for fbx asset', async () => {
      const url = 'www.test.com/file.fbx'
      const type = AssetLoader.getAssetType(url)
      assert.equal(type, AssetExt.FBX)
    })

    it('should work for vrm asset', async () => {
      const url = 'www.test.com/file.vrm'
      const type = AssetLoader.getAssetType(url)
      assert.equal(type, AssetExt.VRM)
    })

    it('should work for png asset', async () => {
      const url = 'www.test.com/file.png'
      const type = AssetLoader.getAssetType(url)
      assert.equal(type, AssetExt.PNG)
    })

    it('should work for jpeg asset', async () => {
      const url = 'www.test.com/file.jpeg'
      const type = AssetLoader.getAssetType(url)
      assert.equal(type, AssetExt.JPEG)
    })
  })

  describe('getAssetClass', () => {
    it('should work for model asset', async () => {
      const url = 'www.test.com/file.gltf'
      const type = AssetLoader.getAssetClass(url)
      assert.equal(type, AssetType.Model)
    })

    it('should work for image asset', async () => {
      const url = 'www.test.com/file.png'
      const type = AssetLoader.getAssetClass(url)
      assert.equal(type, AssetType.Image)
    })

    it('should work for unsupported asset', async () => {
      const url = 'www.test.com/file.pdf'
      const type = AssetLoader.getAssetClass(url)
      assert.equal(type, AssetType.Unknown)
    })
  })

  describe('AssetLoader.load', () => {
    let sandbox

    beforeEach(() => {
      sandbox = Sinon.createSandbox()
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('should give error for empty url', async () => {
      AssetLoader.loadAsset('', undefined, undefined, (err) => {
        assert.notEqual(err, null)
      })
    })
  })

  describe('ABSOLUTE_URL_REGEX', () => {
    it('should match absolute URLs', () => {
      const positiveCases = ['http://example.com', 'https://example.com', 'ftp://example.com', '//example.com']

      positiveCases.forEach((url) => {
        assert.match(url, ABSOLUTE_URL_PROTOCOL_REGEX, `Expected '${url}' to match ABSOLUTE_URL_REGEX`)
      })
    })

    it('should not match relative URLs', () => {
      assert.doesNotMatch(
        'example.com',
        ABSOLUTE_URL_PROTOCOL_REGEX,
        `Expected 'example.com' to not match ABSOLUTE_URL_REGEX`
      )
    })
  })
})
