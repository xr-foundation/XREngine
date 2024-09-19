import { Color, Material, SRGBColorSpace } from 'three'
import matches from 'ts-matches'

import { getComponent, getOptionalComponent, UUIDComponent } from '@xrengine/ecs'
import {
  MaterialPrototypeComponent,
  MaterialPrototypeObjectConstructor,
  MaterialStateComponent
} from '@xrengine/spatial/src/renderer/materials/MaterialComponent'

import {
  getPrototypeEntityFromName,
  injectMaterialDefaults,
  PrototypeNotFoundError
} from '@xrengine/spatial/src/renderer/materials/materialFunctions'
import {
  XRENGINEMaterialExtensionType,
  isOldXRENGINEMaterial,
  OldXRENGINEMaterialExtensionType
} from '../../../exporters/gltf/extensions/XRENGINEMaterialExporterExtension'
import { GLTFLoaderPlugin } from '../GLTFLoader'
import { ImporterExtension } from './ImporterExtension'

export class XRENGINEMaterialImporterExtension extends ImporterExtension implements GLTFLoaderPlugin {
  name = 'XRENGINE_material'

  getMaterialType(materialIndex: number) {
    const parser = this.parser
    const materialDef = parser.json.materials![materialIndex]
    if (!materialDef.extensions?.[this.name]) return null
    const xrengineMaterial: XRENGINEMaterialExtensionType = materialDef.extensions[this.name] as any
    let constructor: MaterialPrototypeObjectConstructor | null = null
    try {
      constructor = getComponent(
        getPrototypeEntityFromName(xrengineMaterial.prototype)!,
        MaterialPrototypeComponent
      ).prototypeConstructor
    } catch (e) {
      if (e instanceof PrototypeNotFoundError) {
        console.warn('prototype ' + xrengineMaterial.prototype + ' not found')
      } else {
        throw e
      }
    }
    return constructor
      ? (function (args) {
          const material = new constructor![xrengineMaterial.prototype](args)
          typeof xrengineMaterial.uuid === 'string' && (material.uuid = xrengineMaterial.uuid)
          return material
        } as unknown as typeof Material)
      : null
  }

  extendMaterialParams(materialIndex: number, materialParams: { [_: string]: any }) {
    const parser = this.parser
    const materialDef = parser.json.materials![materialIndex]
    if (!materialDef.extensions?.[this.name]) return Promise.resolve()
    const extension: XRENGINEMaterialExtensionType = materialDef.extensions[this.name] as any
    if (extension.plugins) {
      if (!materialDef.extras) materialDef.extras = {}
      materialDef.extras['plugins'] = extension.plugins
      for (const plugin of extension.plugins) {
        if (!plugin?.uniforms) continue
        for (const v of Object.values(plugin.uniforms)) {
          if (v.type === 'texture') {
            parser.assignTexture(materialParams, v.name, v.contents)
          }
        }
      }
    }
    const materialComponent = getOptionalComponent(
      UUIDComponent.getEntityByUUID(extension.uuid),
      MaterialStateComponent
    )
    let foundPrototype = false
    if (materialComponent) {
      foundPrototype = !!materialComponent.prototypeEntity
      injectMaterialDefaults(extension.uuid)
    } else {
      try {
        getComponent(getPrototypeEntityFromName(extension.prototype)!, MaterialPrototypeComponent).prototypeArguments
        foundPrototype = true
      } catch (e) {
        if (e instanceof PrototypeNotFoundError) {
          console.warn('prototype ' + extension.prototype + ' not found')
        } else {
          throw e
        }
      }
    }
    if (!foundPrototype) {
      materialDef.extras = materialDef.extras || {}
      materialDef.extras['args'] = extension.args
    }
    //if we found a prototype, we populate the materialParams as normal.
    //if we didn't find a prototype, we populate the materialDef.extras.args to hold for later.
    const parseTarget = foundPrototype ? materialParams : (materialDef.extras!.args as any)
    if (isOldXRENGINEMaterial(extension)) {
      const oldExtension: OldXRENGINEMaterialExtensionType = extension
      return Promise.all(
        Object.entries(oldExtension.args).map(async ([k, v]) => {
          //check if the value is a texture
          if (matches.shape({ index: matches.number }).test(v)) {
            if (k === 'map') {
              await parser.assignTexture(parseTarget, k, v, SRGBColorSpace)
            } else {
              await parser.assignTexture(parseTarget, k, v)
            }
          }
          //check if the value is a color by checking key
          else if ((k.toLowerCase().includes('color') || k === 'emissive') && typeof v === 'number') {
            parseTarget[k] = new Color(v)
          }
          //otherwise, just assign the value
          else {
            parseTarget[k] = v
          }
        })
      )
    }
    return Promise.all(
      Object.entries(extension.args).map(async ([k, v]) => {
        switch (v.type) {
          case undefined:
            break
          case 'texture':
            if (v.contents) {
              if (k === 'map') {
                await parser.assignTexture(parseTarget, k, v.contents, SRGBColorSpace)
              } else {
                await parser.assignTexture(parseTarget, k, v.contents)
              }
            } else {
              parseTarget[k] = null
            }
            break
          case 'color':
            if (v.contents !== null && !(v.contents as Color)?.isColor) {
              parseTarget[k] = new Color(v.contents)
            } else {
              parseTarget[k] = v.contents
            }
            break
          default:
            parseTarget[k] = v.contents
            break
        }
      })
    )
  }
}
