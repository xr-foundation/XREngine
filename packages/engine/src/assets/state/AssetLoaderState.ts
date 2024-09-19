
import { defineState } from '@xrengine/hyperflux'

import { createGLTFLoader } from '../../assets/functions/createGLTFLoader'
import { CORTOLoader } from '../loaders/corto/CORTOLoader'

export const AssetLoaderState = defineState({
  name: 'AssetLoaderState',
  initial: () => {
    const gltfLoader = createGLTFLoader()
    return {
      gltfLoader,
      cortoLoader: null! as CORTOLoader
    }
  }
})
