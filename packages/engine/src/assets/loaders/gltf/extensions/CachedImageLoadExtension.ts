import { LoaderUtils, Texture } from 'three'

import { AssetLoader, getLoader } from '../../../classes/AssetLoader'
import { GLTFLoaderPlugin } from '../GLTFLoader'
import { ImporterExtension } from './ImporterExtension'

class CachedImageLoadExtension extends ImporterExtension implements GLTFLoaderPlugin {
  name = 'XRENGINE_cachedImageLoad'

  static cache = new Map<string, Promise<Texture>>()

  loadTexture(textureIndex) {
    const options = this.parser.options
    const baseURL = new URL(options.url)

    if (!baseURL.pathname.endsWith('.gltf')) {
      return this.parser.loadTexture(textureIndex)
    }
    const json = this.parser.json
    const textureDef = json.textures![textureIndex]
    const sourceIdx = textureDef.source!
    const sourceDef = json.images![sourceIdx]
    const uri = sourceDef.uri ?? ''
    const url = LoaderUtils.resolveURL(uri, options.path!)
    if (!CachedImageLoadExtension.cache.has(url))
      CachedImageLoadExtension.cache.set(
        url,
        this.parser.loadTextureImage(textureIndex, sourceIdx, getLoader(AssetLoader.getAssetType(url)))
      )
    return CachedImageLoadExtension.cache.get(url)!
  }
}

export { CachedImageLoadExtension }
