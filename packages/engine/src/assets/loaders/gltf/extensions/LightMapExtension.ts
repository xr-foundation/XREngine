
// https://github.com/mozilla/hubs/blob/27eb7f3d9eba3b938f1ca47ed5b161547b6fb3f2/src/components/gltf-model-plus.js
import { Mesh, MeshBasicMaterial, MeshStandardMaterial, RepeatWrapping, Texture } from 'three'

import iterateObject3D from '@xrengine/spatial/src/common/functions/iterateObject3D'

import { GLTF, GLTFLoaderPlugin } from '../GLTFLoader'
import { ImporterExtension } from './ImporterExtension'

export type MOZ_lightmap = {
  index: number
  texCoord: number
  intensity: number
  extensions: {
    [extname: string]: any
  }
}

export class HubsLightMapExtension extends ImporterExtension implements GLTFLoaderPlugin {
  name = 'MOZ_lightmap'

  // @TODO: Ideally we should use extendMaterialParams hook.
  loadMaterial(materialIndex) {
    const parser = this.parser
    const json = parser.json
    const materialDef = json.materials![materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return null
    }

    const extensionDef: MOZ_lightmap = materialDef.extensions[this.name] as any

    const pending: any[] = []

    pending.push(parser.loadMaterial(materialIndex))
    pending.push(parser.getDependency('texture', extensionDef.index))

    return Promise.all(pending).then((results) => {
      const material: MeshStandardMaterial | MeshBasicMaterial = results[0]
      const lightMap: Texture = (results[1] as Texture).clone()
      lightMap.channel = 1
      const transform = extensionDef.extensions ? extensionDef.extensions['KHR_texture_transform'] : undefined
      if (transform !== undefined) {
        lightMap.wrapS = RepeatWrapping
        lightMap.wrapT = RepeatWrapping
        lightMap.rotation = transform.rotation ?? 0
        lightMap.offset.x = transform.offset[0]
        lightMap.offset.y = transform.offset[1]
        lightMap.repeat.x = transform.scale[0]
        lightMap.repeat.y = transform.scale[1]
      }
      material.lightMap = lightMap
      material.lightMapIntensity = extensionDef.intensity ?? 1.0
      //fix for change to MeshBasicMaterial shading WRT lightmaps
      if (material.type === 'MeshBasicMaterial') {
        material.lightMapIntensity *= Math.PI
      }
      return material
    })
  }

  afterRoot(result: GLTF): Promise<void> {
    iterateObject3D(result.scene, (mesh: Mesh) => {
      if (!mesh?.isMesh) return
      const material = mesh.material as MeshStandardMaterial | MeshBasicMaterial
      if (!material.lightMap) return
      if (!mesh.geometry.hasAttribute('uv1')) {
        console.warn('Mesh has lightmap but no uv2 attribute', mesh)
        material.lightMap = null
      }
    })
    return Promise.resolve()
  }
  /*
  loadTexture( textureIndex ) {

    const parser = this.parser;
    const json = parser.json;
    const name = this.name;
    const textureDef = json.textures[ textureIndex ];

    const source = textureDef.source
    const loader = parser.options.ktx2Loader;

    if ( ! loader ) {

      if ( json.extensionsRequired && json.extensionsRequired.indexOf( name ) >= 0 ) {

        throw new Error( 'THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures' );

      } else {

        // Assumes that the extension is optional and that a fallback texture is present
        return null;

      }

    }

    return parser.loadTextureImage( textureIndex, source, loader );

  }*/
}
