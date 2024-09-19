import {
  Extension,
  ExtensionProperty,
  IProperty,
  Nullable,
  Property,
  PropertyType,
  ReaderContext,
  Texture,
  TextureInfo,
  WriterContext
} from '@gltf-transform/core'
import { KHRTextureTransform } from '@gltf-transform/extensions'

const EXTENSION_NAME = 'XRENGINE_material'

interface IXRENGINEArgEntry extends IProperty {
  type: string
  contents: any
}

interface IXRENGINEArgs extends IProperty {
  [field: string]: any
}

interface IXRENGINEMaterial extends IProperty {
  uuid: string
  name: string
  prototype: string
  args: XRENGINEMaterialArgs
  plugins: string[]
}

interface XRENGINEArgsDef {
  type?: string
  contents?: any
}

interface XRENGINEArgs {
  [field: string]: XRENGINEArgsDef
}

interface XRENGINEMaterialDef {
  uuid?: string
  name?: string
  prototype?: string
  args?: XRENGINEArgs
  plugins?: string[]
}

export class XRENGINEMaterialArgs extends Property<IEEArgs> {
  public declare propertyType: 'XRENGINEMaterialArgs'
  public declare parentTypes: ['XRENGINEMaterial']
  protected init(): void {
    this.propertyType = 'XRENGINEMaterialArgs'
    this.parentTypes = ['XRENGINEMaterial']
  }

  protected getDefaults(): Nullable<IEEArgs> {
    return Object.assign(super.getDefaults() as IProperty, {
      extras: {}
    })
  }

  public getProp(field: string) {
    return this.get(field)
  }

  public getPropRef(field: string) {
    return this.getRef(field)
  }

  public setProp(field: string, value: any) {
    this.set(field, value)
  }
  public setPropRef(field: string, value: any) {
    this.setRef(field, value)
  }
}

export class XRENGINEArgEntry extends Property<IEEArgEntry> {
  public declare propertyType: 'XRENGINEMaterialArgEntry'
  public declare parentTypes: ['XRENGINEMaterialArgs']
  protected init(): void {
    this.propertyType = 'XRENGINEMaterialArgEntry'
    this.parentTypes = ['XRENGINEMaterialArgs']
  }

  protected getDefaults(): Nullable<IEEArgEntry> {
    return Object.assign(super.getDefaults() as IProperty, {
      name: '',
      type: '',
      contents: null,
      extras: {}
    })
  }

  public get type() {
    return this.get('type')
  }
  public set type(val: string) {
    this.set('type', val)
  }
  public get contents() {
    return this.get('contents')
  }
  public set contents(val) {
    this.set('contents', val)
  }
}

export class XRENGINEMaterial extends ExtensionProperty<IXRENGINEMaterial> {
  public static EXTENSION_NAME = EXTENSION_NAME
  public declare extensionName: typeof EXTENSION_NAME
  public declare propertyType: 'XRENGINEMaterial'
  public declare parentTypes: [PropertyType.MATERIAL]

  protected init(): void {
    this.extensionName = EXTENSION_NAME
    this.propertyType = 'XRENGINEMaterial'
    this.parentTypes = [PropertyType.MATERIAL]
  }

  protected getDefaults(): Nullable<IXRENGINEMaterial> {
    return Object.assign(super.getDefaults() as IProperty, {
      uuid: '',
      name: '',
      prototype: '',
      args: null,
      plugins: []
    })
  }

  public get uuid() {
    return this.get('uuid')
  }
  public set uuid(val: string) {
    this.set('uuid', val)
  }
  public get name() {
    return this.get('name')
  }
  public set name(val: string) {
    this.set('name', val)
  }
  public get prototype() {
    return this.get('prototype')
  }
  public set prototype(val: string) {
    this.set('prototype', val)
  }
  public get args() {
    return this.getRef('args')
  }
  public set args(val) {
    this.setRef('args', val)
  }
  public get plugins() {
    return this.get('plugins')
  }
  public set plugins(val: string[]) {
    this.set('plugins', val)
  }
}

export class XRENGINEMaterialExtension extends Extension {
  public readonly extensionName = EXTENSION_NAME
  public static readonly EXTENSION_NAME = EXTENSION_NAME

  textureInfoMap: Map<string, TextureInfo> = new Map()
  materialInfoMap: Map<string, string[]> = new Map()
  public read(readerContext: ReaderContext): this {
    const materialDefs = readerContext.jsonDoc.json.materials || []
    let textureUuidIndex = 0
    let materialUuidIndex = 0
    materialDefs.map((def, idx) => {
      if (def.extensions?.[EXTENSION_NAME]) {
        const xrengineMaterial = new XRENGINEMaterial(this.document.getGraph())
        readerContext.materials[idx].setExtension(EXTENSION_NAME, xrengineMaterial)

        const eeDef = def.extensions[EXTENSION_NAME] as XRENGINEMaterialDef

        if (eeDef.uuid) {
          xrengineMaterial.uuid = eeDef.uuid
        }
        if (eeDef.name) {
          xrengineMaterial.name = eeDef.name
        }
        if (eeDef.prototype) {
          xrengineMaterial.prototype = eeDef.prototype
        }
        if (eeDef.args) {
          //xrengineMaterial.args = eeDef.args
          const processedArgs = new XRENGINEMaterialArgs(this.document.getGraph())
          const materialArgsInfo = Object.keys(eeDef.args)
          const materialUuid = materialUuidIndex.toString()
          materialUuidIndex++
          this.materialInfoMap.set(materialUuid, materialArgsInfo)
          processedArgs.setExtras({ uuid: materialUuid })
          Object.entries(eeDef.args).map(([field, argDef]) => {
            const nuArgDef = new XRENGINEArgEntry(this.document.getGraph())
            nuArgDef.type = argDef.type!
            if (argDef.type === 'texture') {
              const value = argDef.contents
              const texture = value ? readerContext.textures[value.index] : null
              if (texture) {
                const textureInfo = new TextureInfo(this.document.getGraph())
                readerContext.setTextureInfo(textureInfo, value)
                if (texture && value.extensions?.KHR_texture_transform) {
                  const extensionData = value.extensions.KHR_texture_transform
                  const transform = new KHRTextureTransform(this.document).createTransform()
                  extensionData.offset && transform.setOffset(extensionData.offset)
                  extensionData.scale && transform.setScale(extensionData.scale)
                  extensionData.rotation && transform.setRotation(extensionData.rotation)
                  extensionData.texCoord && transform.setTexCoord(extensionData.texCoord)
                  textureInfo.setExtension('KHR_texture_transform', transform)
                }
                const uuid = textureUuidIndex.toString()
                textureUuidIndex++
                texture.setExtras({ uuid })
                this.textureInfoMap.set(uuid, textureInfo)
              }
              nuArgDef.contents = texture
              processedArgs.setPropRef(field, nuArgDef)
            } else {
              nuArgDef.contents = argDef.contents
              processedArgs.setProp(field, nuArgDef)
            }
          })
          xrengineMaterial.args = processedArgs
        }
        if (eeDef.plugins) {
          xrengineMaterial.plugins = eeDef.plugins
        }
      }
    })
    return this
  }

  public write(writerContext: WriterContext): this {
    const json = writerContext.jsonDoc
    this.document
      .getRoot()
      .listMaterials()
      .map((material) => {
        const xrengineMaterial = material.getExtension<XRENGINEMaterial>(EXTENSION_NAME)
        if (xrengineMaterial) {
          const matIdx = writerContext.materialIndexMap.get(material)!
          const matDef = json.json.materials![matIdx]
          const extensionDef: XRENGINEMaterialDef = {
            uuid: xrengineMaterial.uuid,
            name: xrengineMaterial.name,
            prototype: xrengineMaterial.prototype,
            plugins: xrengineMaterial.plugins
          }
          const matArgs = xrengineMaterial.args
          if (matArgs) {
            extensionDef.args = {}
            const materialArgsInfo = this.materialInfoMap.get(matArgs.getExtras().uuid as string)!
            materialArgsInfo.map((field) => {
              let value: XRENGINEArgEntry
              try {
                value = matArgs.getPropRef(field) as XRENGINEArgEntry
              } catch (e) {
                value = matArgs.getProp(field) as XRENGINEArgEntry
              }
              if (value.type === 'texture') {
                const argEntry = new XRENGINEArgEntry(this.document.getGraph())
                argEntry.type = 'texture'
                const texture = value.contents as Texture
                if (texture) {
                  const uuid = texture.getExtras().uuid as string
                  const textureInfo = this.textureInfoMap.get(uuid)!
                  argEntry.contents = writerContext.createTextureInfoDef(texture, textureInfo)
                } else {
                  argEntry.contents = null
                }
                extensionDef.args![field] = {
                  type: argEntry.type,
                  contents: argEntry.contents
                }
              } else {
                extensionDef.args![field] = {
                  type: value.type,
                  contents: value.contents
                }
              }
            })
          }
          matDef.extensions = matDef.extensions || {}
          matDef.extensions[EXTENSION_NAME] = extensionDef
        }
      })
    return this
  }
}
