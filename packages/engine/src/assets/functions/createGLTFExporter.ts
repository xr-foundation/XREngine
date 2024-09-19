import BasisuExporterExtension from '../exporters/gltf/extensions/BasisuExporterExtension'
import BufferHandlerExtension from '../exporters/gltf/extensions/BufferHandlerExtension'
import { XRENGINEECSExporterExtension } from '../exporters/gltf/extensions/XRENGINEECSExporterExtension'
import XRENGINEMaterialExporterExtension from '../exporters/gltf/extensions/XRENGINEMaterialExporterExtension'
import GPUInstancingExporterExtension from '../exporters/gltf/extensions/GPUInstancingExporterExtension'
import IgnoreGeometryExporterExtension from '../exporters/gltf/extensions/IgnoreGeometryExporterExtension'
import ImageRoutingExtension from '../exporters/gltf/extensions/ImageRoutingExtension'
import ResourceIDExtension from '../exporters/gltf/extensions/ResourceIDExtension'
import SourceHandlerExtension from '../exporters/gltf/extensions/SourceHandlerExtension'
import { GLTFExporter, GLTFWriter } from '../exporters/gltf/GLTFExporter'

export default function createGLTFExporter() {
  const exporter = new GLTFExporter()

  const extensions = [
    IgnoreGeometryExporterExtension,
    GPUInstancingExporterExtension,
    ImageRoutingExtension,
    XRENGINEMaterialExporterExtension,
    XRENGINEECSExporterExtension,
    ResourceIDExtension,
    SourceHandlerExtension
    //ImageProcessingExtension
  ]
  extensions.forEach((extension) => exporter.register((writer) => new extension(writer)))

  //create persistent instances of basisu and buffer extensions to maintain cache
  const basisUExtension = new BasisuExporterExtension(new GLTFWriter())
  exporter.register((writer) => {
    basisUExtension.writer = writer
    return basisUExtension
  })
  const bufferHandlerExtension = new BufferHandlerExtension(new GLTFWriter())
  exporter.register((writer) => {
    bufferHandlerExtension.writer = writer
    return bufferHandlerExtension
  })

  return exporter
}
