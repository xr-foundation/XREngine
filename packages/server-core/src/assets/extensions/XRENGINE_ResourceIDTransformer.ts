import {
  Extension,
  ExtensionProperty,
  IProperty,
  Nullable,
  PropertyType,
  ReaderContext,
  WriterContext
} from '@gltf-transform/core'

import { ResourceID } from '@xrengine/engine/src/assets/classes/ModelTransform'

const EXTENSION_NAME = 'XRENGINE_resourceID'

interface IXRENGINEResourceID extends IProperty {
  resourceId: ResourceID
}

interface XRENGINEResourceIDDef {
  resourceId?: ResourceID
}

export class XRENGINEResourceID extends ExtensionProperty<IEEResourceID> {
  public static EXTENSION_NAME: string = EXTENSION_NAME
  public declare extensionName: typeof EXTENSION_NAME
  public declare propertyType: 'EEResourceID'
  public declare parentTypes: [PropertyType.TEXTURE, PropertyType.PRIMITIVE]

  protected init(): void {
    this.extensionName = EXTENSION_NAME
    this.propertyType = 'EEResourceID'
    this.parentTypes = [PropertyType.TEXTURE, PropertyType.PRIMITIVE]
  }

  protected getDefaults(): Nullable<IEEResourceID> {
    return Object.assign(super.getDefaults() as IProperty, {
      resourceId: '' as ResourceID
    })
  }

  public get resourceId(): ResourceID {
    return this.get('resourceId')
  }

  public set resourceId(resourceId: ResourceID) {
    this.set('resourceId', resourceId)
  }
}

export class XRENGINEResourceIDExtension extends Extension {
  public readonly extensionName: string = EXTENSION_NAME
  public static readonly EXTENSION_NAME: string = EXTENSION_NAME

  public read(readerContext: ReaderContext): this {
    const jsonDoc = readerContext.jsonDoc
    ;(jsonDoc.json.textures || []).map((def, idx) => {
      if (def.extensions?.[EXTENSION_NAME]) {
        const eeResourceID = new XRENGINEResourceID(this.document.getGraph())
        readerContext.textures[idx].setExtension(EXTENSION_NAME, eeResourceID)
        const eeDef = def.extensions[EXTENSION_NAME] as XRENGINEResourceIDDef
        eeDef.resourceId && (eeResourceID.resourceId = eeDef.resourceId)
      }
    })
    return this
  }

  public write(writerContext: WriterContext): this {
    const jsonDoc = writerContext.jsonDoc
    this.document
      .getRoot()
      .listTextures()
      .map((texture, index) => {
        const eeResourceID = texture.getExtension(EXTENSION_NAME) as XRENGINEResourceID
        if (!eeResourceID) return
        const textureDef = jsonDoc.json.textures![index]
      })
    return this
  }
}
