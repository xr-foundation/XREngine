import { sha3_256 } from 'js-sha3'
import { LoaderUtils, Mesh, Object3D } from 'three'
import matches, { Validator } from 'ts-matches'
import { v4 as uuidv4 } from 'uuid'

import { pathJoin } from '@xrengine/engine/src/assets/functions/miscUtils'
import { defineAction, dispatchAction, getMutableState, getState, NO_PROXY } from '@xrengine/hyperflux'
import iterateObject3D from '@xrengine/spatial/src/common/functions/iterateObject3D'

import { AssetLoader } from '../../../classes/AssetLoader'
import { modelResourcesPath } from '../../../functions/pathResolver'
import { DomainConfigState } from '../../../state/DomainConfigState'
import { UploadRequestState } from '../../../state/UploadRequestState'
import { GLTFExporterPlugin, GLTFWriter } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

type BufferJson = {
  name: string
  byteLength: number
  uri: string
  extensions?: { [extName: string]: any }
}

type BufferDefinition = BufferJson & {
  buffer: ArrayBuffer
}

export default class BufferHandlerExtension extends ExporterExtension implements GLTFExporterPlugin {
  static beginModelExport = defineAction({
    type: 'xre.assets.BufferHandlerExtension.BEGIN_MODEL_EXPORT' as const,
    projectName: matches.string,
    modelName: matches.string
  })
  static saveBuffer = defineAction({
    type: 'xre.assets.BufferHandlerExtension.SAVE_BUFFER' as const,
    projectName: matches.string,
    modelName: matches.string,
    saveParms: matches.object as Validator<unknown, BufferDefinition>
  })

  projectName: string
  modelName: string
  resourceURI: string | null

  comparisonCanvas: HTMLCanvasElement
  bufferCache: Record<string, string>

  constructor(writer: GLTFWriter) {
    super(writer)
    this.bufferCache = {}
    this.comparisonCanvas = document.createElement('canvas')
  }

  beforeParse(input: Object3D | Object3D[]) {
    const writer = this.writer
    if (writer.options.embedImages) return
    // this.projectName = getProjectName(writer.options.path!)
    // this.modelName = getRelativeURI(writer.options.path!)
    this.projectName = writer.options.projectName ?? ''
    this.modelName = writer.options.relativePath ?? ''
    this.resourceURI = writer.options.resourceURI ?? null
    const inputs = Array.isArray(input) ? input : [input]
    inputs.forEach((input) =>
      iterateObject3D(input, (child: Mesh) => {
        if (child?.isMesh) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach((material) => {
            console.log(material)
          })
        }
      })
    )
    dispatchAction(
      BufferHandlerExtension.beginModelExport({
        projectName: this.projectName,
        modelName: this.modelName
      })
    )
  }

  writeImage(image: HTMLImageElement | HTMLCanvasElement, imageDef: { [key: string]: any }) {
    //only execute when images are not embedded
    if (this.writer.options.embedImages) return
    const name = uuidv4()
    const projectName = this.projectName
    const modelName = this.modelName
    let buffer: ArrayBuffer
    let uri: string
    let bufferPromise: Promise<void>
    if (image instanceof HTMLCanvasElement) {
      if (typeof image.toBlob !== 'function') {
        console.error('trying to serialize unprocessed canvas')
      }
      uri = `${this.resourceURI ?? modelResourcesPath(modelName)}/images/${name}.png`
      bufferPromise = new Promise<void>(async (resolve) => {
        buffer = await new Promise<ArrayBuffer>((resolve) => {
          image.toBlob((blob) => blob!.arrayBuffer().then(resolve))
        })
        resolve()
      })
    } else {
      if (!image.src) {
        console.error('trying to serialize unprocessed image')
      }
      if (!/^blob:/.test(image.src)) return
      uri = `${this.resourceURI ?? modelResourcesPath(modelName)}/images/${name}.png`
      bufferPromise = new Promise<void>((resolve) => {
        fetch(image.src)
          .then((response) => response.blob())
          .then((blob) => blob.arrayBuffer())
          .then((arrayBuf) => {
            buffer = arrayBuf
            resolve()
          })
      })
    }
    this.writer.pending.push(
      bufferPromise.then(() => {
        const projectSpaceModelName = this.resourceURI
          ? LoaderUtils.resolveURL(uri, LoaderUtils.extractUrlBase(modelName))
          : modelName
        const finalURI = this.resourceURI ? projectSpaceModelName.replace(/^assets\//, '') : uri
        imageDef.uri = uri
        imageDef.mimeType = `image/${AssetLoader.getAssetType(uri)}`
        const blob = new Blob([buffer])
        const file = new File([blob], finalURI)
        const uploadRequestState = getMutableState(UploadRequestState)
        const queue = uploadRequestState.queue.get(NO_PROXY)
        const nuQueue = [...queue, { file, projectName }]
        uploadRequestState.queue.set(nuQueue)
      })
    )
  }

  afterParse(input: Object3D | Object3D[]) {
    const writer = this.writer
    const projectName = this.projectName
    const modelName = this.modelName

    const json = writer.json
    const buffers = writer.buffers
    const options = writer.options

    if (!options?.binary) {
      const images = writer.json.images || []
      // const basePath = LoaderUtils.extractUrlBase(writer.options.path!)
      const basePath = LoaderUtils.extractUrlBase(
        pathJoin(
          getState(DomainConfigState).cloudDomain,
          'projects',
          writer.options.projectName!,
          writer.options.relativePath!
        )
      )
      //make uris relative to model src
      for (const image of images) {
        if (!image.uri) continue
        image.uri = image.uri.replace(basePath, '')
      }
      writer.buffers.map((buffer, index) => {
        const hash = sha3_256.create()
        const view = new DataView(buffer)
        for (let i = 0; i < buffer.byteLength; i++) {
          hash.update(String.fromCharCode(view.getUint8(i)))
        }
        const name = hash.hex()
        const uri = `${this.resourceURI ?? modelResourcesPath(modelName)}/buffers/${name}.bin`
        const projectSpaceModelName = this.resourceURI
          ? LoaderUtils.resolveURL(uri, LoaderUtils.extractUrlBase(modelName))
          : modelName
        const bufferDef: BufferJson = {
          name,
          byteLength: buffer.byteLength,
          uri
        }
        json.buffers[index] = bufferDef
        if (!this.bufferCache[name]) {
          const finalURI = this.resourceURI ? projectSpaceModelName.replace(/^assets\//, '') : uri
          const blob = new Blob([buffers[index]])
          const file = new File([blob], finalURI)
          const uploadRequestState = getMutableState(UploadRequestState)
          const queue = uploadRequestState.queue.get(NO_PROXY)
          const nuQueue = [...queue, { file, projectName }]
          uploadRequestState.queue.set(nuQueue)
          this.bufferCache[name] = uri
        } else {
          bufferDef.uri = this.bufferCache[name]
        }
      })
    }
  }
}
