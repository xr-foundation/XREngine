
import { VRMLoaderPlugin } from '@pixiv/three-vrm'
import { Group, WebGLRenderer } from 'three'

import { getState, isClient } from '@xrengine/hyperflux'

import { DRACOLoader } from '../loaders/gltf/DRACOLoader'
import { CachedImageLoadExtension } from '../loaders/gltf/extensions/CachedImageLoadExtension'
import XRENGINEECSImporterExtension from '../loaders/gltf/extensions/XRENGINEECSImporterExtension'
import { XRENGINEMaterialImporterExtension } from '../loaders/gltf/extensions/XRENGINEMaterialImporterExtension'
import { GPUInstancingExtension } from '../loaders/gltf/extensions/GPUInstancingExtension'
import { HubsComponentsExtension } from '../loaders/gltf/extensions/HubsComponentsExtension'
import { KHRMaterialsPBRSpecularGlossinessExtension } from '../loaders/gltf/extensions/KHRMaterialsPBRSpecularGlossinessExtension'
import { HubsLightMapExtension } from '../loaders/gltf/extensions/LightMapExtension'
import { RemoveMaterialsExtension } from '../loaders/gltf/extensions/RemoveMaterialsExtension'
import { ResourceManagerLoadExtension } from '../loaders/gltf/extensions/ResourceManagerLoadExtension'
import { GLTFLoader } from '../loaders/gltf/GLTFLoader'
import { KTX2Loader } from '../loaders/gltf/KTX2Loader'
import { MeshoptDecoder } from '../loaders/gltf/meshopt_decoder.module'
import { loadDRACODecoderNode, NodeDRACOLoader } from '../loaders/gltf/NodeDracoLoader'
import { DomainConfigState } from '../state/DomainConfigState'

export const initializeKTX2Loader = (loader: GLTFLoader) => {
  const ktxLoader = new KTX2Loader()
  ktxLoader.setTranscoderPath(getState(DomainConfigState).publicDomain + '/loader_decoders/basis/')
  const renderer = new WebGLRenderer()
  ktxLoader.detectSupport(renderer)
  renderer.dispose()
  loader.setKTX2Loader(ktxLoader)
}

export const createGLTFLoader = (keepMaterials = false) => {
  const loader = new GLTFLoader()
  if (isClient) initializeKTX2Loader(loader)

  if (isClient || keepMaterials) {
    loader.register((parser) => new GPUInstancingExtension(parser))
    loader.register((parser) => new HubsLightMapExtension(parser))
    loader.registerFirst((parser) => new XRENGINEMaterialImporterExtension(parser))
  } else {
    loader.register((parser) => new RemoveMaterialsExtension(parser))
  }
  loader.register((parser) => new KHRMaterialsPBRSpecularGlossinessExtension(parser))
  loader.register((parser) => new XRENGINEECSImporterExtension(parser))
  loader.register((parser) => new HubsComponentsExtension(parser))
  loader.register((parser) => new VRMLoaderPlugin(parser, { helperRoot: new Group(), autoUpdateHumanBones: false }))
  loader.register((parser) => new CachedImageLoadExtension(parser))
  loader.register((parser) => new ResourceManagerLoadExtension(parser))

  if (MeshoptDecoder.useWorkers) {
    MeshoptDecoder.useWorkers(2)
  }
  loader.setMeshoptDecoder(MeshoptDecoder)

  if (isClient) {
    initializeKTX2Loader(loader)
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath(getState(DomainConfigState).publicDomain + '/loader_decoders/')
    dracoLoader.setWorkerLimit(1)
    loader.setDRACOLoader(dracoLoader)
  } else {
    loadDRACODecoderNode()
    const dracoLoader = new NodeDRACOLoader()
    /* @ts-ignore */
    dracoLoader.preload = () => {}
    /* @ts-ignore */
    loader.setDRACOLoader(dracoLoader)
  }

  return loader
}
