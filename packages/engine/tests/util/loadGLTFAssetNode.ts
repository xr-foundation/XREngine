import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'

import { FileLoader } from '../../src/assets/loaders/base/FileLoader'

const toArrayBuffer = (buf) => {
  const arrayBuffer = new ArrayBuffer(buf.length)
  const view = new Uint8Array(arrayBuffer)
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return arrayBuffer
}

const original = FileLoader.prototype.load

export function overrideFileLoaderLoad() {
  beforeEach(() => {
    function overrideLoad(url, onLoad, onProgress, onError) {
      try {
        const assetPathAbsolute = path.join(appRootPath.path, url)
        const buffer = toArrayBuffer(fs.readFileSync(assetPathAbsolute))
        onLoad(buffer)
      } catch (e) {
        onError(e)
      }
    }
    FileLoader.prototype.load = overrideLoad
  })
  afterEach(() => {
    FileLoader.prototype.load = original
  })
}

// export const loadGLTFAssetNode = async (assetPath: string, includeMaterials = false): Promise<GLTF> => {
//   const assetPathAbsolute = path.join(appRootPath.path, assetPath)
//   const loader = createGLTFLoader(includeMaterials)
//   const modelBuffer = toArrayBuffer(await fs.promises.readFile(assetPathAbsolute))
//   return new Promise((resolve, reject) => loader.parse(modelBuffer, appRootPath.path, resolve, reject))
// }
