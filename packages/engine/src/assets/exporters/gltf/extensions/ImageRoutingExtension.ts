
import { Material, Object3D, Object3DEventMap, Texture } from 'three'

import { EntityUUID, UUIDComponent, getOptionalComponent } from '@xrengine/ecs'
import { pathJoin, relativePathTo } from '@xrengine/engine/src/assets/functions/miscUtils'

import { EditorState } from '@xrengine/editor/src/services/EditorServices'
import { STATIC_ASSET_REGEX } from '@xrengine/engine/src/assets/functions/pathResolver'
import { getState } from '@xrengine/hyperflux'
import { SourceComponent } from '../../../../scene/components/SourceComponent'
import { GLTFExporterPlugin, GLTFWriter } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'
export default class ImageRoutingExtension extends ExporterExtension implements GLTFExporterPlugin {
  replacementImages: { texture: Texture; original: HTMLImageElement }[]

  constructor(writer: GLTFWriter) {
    super(writer)
    this.replacementImages = []
  }

  writeMaterial(material: Material, materialDef: { [key: string]: any }): void {
    if (this.writer.options.binary || this.writer.options.embedImages) return
    const materialEntity = UUIDComponent.getEntityByUUID(material.uuid as EntityUUID)
    if (!materialEntity) return
    const src = getOptionalComponent(materialEntity, SourceComponent)
    if (!src) return
    const resolvedPath = STATIC_ASSET_REGEX.exec(src)!
    //const projectDst = this.writer.options.projectName!
    // let projectSrc = this.writer.options.projectName!
    const projectDst = getState(EditorState).projectName!
    let projectSrc = getState(EditorState).projectName!
    let relativeSrc = './assets/'
    if (resolvedPath) {
      projectSrc = `${resolvedPath[1]}/${resolvedPath[2]}`
      relativeSrc = resolvedPath[3]
      relativeSrc = relativeSrc.replace(/\/[^\/]*$/, '')
    }
    const dst = this.writer.options.relativePath!.replace(/\/[^\/]*$/, '')
    const relativeBridge = relativePathTo(pathJoin(projectDst, dst), pathJoin(projectSrc, relativeSrc))

    for (const [field, value] of Object.entries(material)) {
      if (field === 'envMap') continue
      if (value instanceof Texture) {
        const texture = value as Texture
        if (texture.image instanceof ImageBitmap) continue
        let oldURI = texture.userData.src
        if (!oldURI) {
          const resolved = STATIC_ASSET_REGEX.exec(texture.image.src)!
          const oldProject = `${resolved[1]}/${resolved[2]}`
          const relativeOldURL = resolved[3]
          if (oldProject !== projectSrc) {
            const srcWithProject = pathJoin(projectSrc, relativeSrc)
            const dstWithProject = pathJoin(oldProject, relativeOldURL)
            oldURI = relativePathTo(srcWithProject, dstWithProject)
          } else {
            oldURI = relativePathTo(relativeSrc, relativeOldURL)
          }
        }
        const newURI = pathJoin(relativeBridge, oldURI)
        if (!texture.image.src) {
          texture.image.src = newURI
        } else {
          this.replacementImages.push({ texture, original: texture.image })
          texture.image = { src: newURI } as any
        }
      }
    }
  }

  afterParse(input: Object3D<Object3DEventMap> | Object3D<Object3DEventMap>[]) {
    for (const { texture, original } of this.replacementImages) {
      texture.image = original
    }
  }
}
