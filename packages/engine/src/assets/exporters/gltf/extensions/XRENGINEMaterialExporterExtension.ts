import { CubeTexture, Material, Texture } from 'three'
import matches from 'ts-matches'

import { EntityUUID, getComponent, hasComponent, UUIDComponent } from '@xrengine/ecs'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import {
  MaterialPlugins,
  MaterialPrototypeComponent,
  MaterialStateComponent
} from '@xrengine/spatial/src/renderer/materials/MaterialComponent'

import { injectMaterialDefaults } from '@xrengine/spatial/src/renderer/materials/materialFunctions'
import { GLTFWriter } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

export type OldXRENGINEMaterialExtensionType = {
  uuid: string
  name: string
  prototype: string
  args: {
    [field: string]: any
  }
}

export function isOldXRENGINEMaterial(extension: any) {
  const argValues = Object.values(extension.args)
  return !matches
    .arrayOf(
      matches.shape({
        type: matches.string
      })
    )
    .test(argValues)
}

export type MaterialExtensionPluginType = { id: string; uniforms: { [key: string]: any } }

export type XRENGINEMaterialExtensionType = {
  uuid: EntityUUID
  name: string
  prototype: string
  args: {
    [field: string]: {
      type: string
      contents: any
    }
  }
  plugins: MaterialExtensionPluginType[]
}

export default class XRENGINEMaterialExporterExtension extends ExporterExtension {
  constructor(writer: GLTFWriter) {
    super(writer)
    this.name = 'XRENGINE_material'
    this.matCache = new Map()
  }

  matCache: Map<any, any>

  writeMaterial(material: Material, materialDef) {
    const materialEntityUUID = material.uuid as EntityUUID
    const materialEntity = UUIDComponent.getEntityByUUID(materialEntityUUID)
    const argData = injectMaterialDefaults(materialEntityUUID)
    if (!argData) return
    const result: any = {}
    Object.entries(argData).map(([k, v]) => {
      const argEntry = {
        type: v.type,
        contents: material[k]
      }
      if (v.type === 'texture' && material[k]) {
        if (k === 'envMap') return //for skipping environment maps which cause errors
        if ((material[k] as CubeTexture).isCubeTexture) return //for skipping environment maps which cause errors
        const texture = material[k] as Texture
        if (texture.source.data && this.matCache.has(texture.source.data)) {
          argEntry.contents = this.matCache.get(texture.source.data)
        } else {
          const mapDef = {
            index: this.writer.processTexture(texture)
          }
          this.matCache.set(texture.source.data, { ...mapDef })
          argEntry.contents = mapDef
        }
        argEntry.contents.texCoord = texture.channel
        this.writer.options.flipY && (texture.repeat.y *= -1)
        this.writer.applyTextureTransform(argEntry.contents, texture)
      }
      result[k] = argEntry
    })
    delete materialDef.pbrMetallicRoughness
    delete materialDef.normalTexture
    delete materialDef.emissiveTexture
    delete materialDef.emissiveFactor
    const materialComponent = getComponent(materialEntity, MaterialStateComponent)
    const prototype = getComponent(materialComponent.prototypeEntity!, MaterialPrototypeComponent)
    const plugins = Object.keys(MaterialPlugins)
      .map((plugin) => {
        if (!hasComponent(materialEntity, MaterialPlugins[plugin])) return
        const pluginComponent = getComponent(materialEntity, MaterialPlugins[plugin])
        const uniforms = {}
        for (const key in pluginComponent) {
          uniforms[key] = pluginComponent[key].value
        }
        return { id: plugin, uniforms }
      })
      .filter(Boolean)
    materialDef.extensions = materialDef.extensions ?? {}
    materialDef.extensions[this.name] = {
      uuid: getComponent(materialEntity, UUIDComponent),
      name: getComponent(materialEntity, NameComponent),
      prototype: Object.keys(prototype.prototypeConstructor!)[0],
      plugins: plugins,
      args: result
    }
    materialDef.name = getComponent(materialEntity, NameComponent)
    this.writer.extensionsUsed[this.name] = true
  }
}
