
import { Object3D } from 'three'

import { ResourceManager } from '@xrengine/spatial/src/resources/ResourceState'

import { GLTF, GLTFLoaderPlugin } from '../GLTFLoader'
import { ImporterExtension } from './ImporterExtension'

class ResourceManagerLoadExtension extends ImporterExtension implements GLTFLoaderPlugin {
  name = 'XRENGINE_resourceManagerLoadExtension'

  beforeRoot(): Promise<void> | null {
    return null
  }

  afterRoot(result: GLTF): Promise<void> | null {
    this.AddAssetToResourceManager(result.scene)
    return null
  }

  AddAssetToResourceManager(asset: Object3D) {
    const parser = this.parser
    const assetKey = parser.options.url
    ResourceManager.addReferencedAsset(assetKey, asset)
    if (asset.children) for (const child of asset.children) this.AddAssetToResourceManager(child)
  }
}

export { ResourceManagerLoadExtension }
