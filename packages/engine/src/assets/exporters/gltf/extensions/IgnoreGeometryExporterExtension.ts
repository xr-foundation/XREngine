
import { Mesh, Object3D } from 'three'

import { Entity, getComponent, hasComponent, removeComponent } from '@xrengine/ecs'
import { MeshComponent } from '@xrengine/spatial/src/renderer/components/MeshComponent'
import { iterateEntityNode } from '@xrengine/spatial/src/transform/components/EntityTree'

import { GroundPlaneComponent } from '../../../../scene/components/GroundPlaneComponent'
import { ImageComponent } from '../../../../scene/components/ImageComponent'
import { PrimitiveGeometryComponent } from '../../../../scene/components/PrimitiveGeometryComponent'
import { GLTFExporterPlugin, GLTFWriter } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

export default class IgnoreGeometryExporterExtension extends ExporterExtension implements GLTFExporterPlugin {
  entitySet: { entity: Entity; parent: Entity }[]
  meshSet: { mesh: Mesh; parent: Entity }[]
  constructor(writer: GLTFWriter) {
    super(writer)
    this.name = 'XRENGINE_ignoreGeometry'
    this.entitySet = [] as { entity: Entity; parent: Entity }[]
    this.meshSet = [] as { mesh: Mesh; parent: Entity }[]
  }
  beforeParse(input: Object3D | Object3D[]) {
    const root = (Array.isArray(input) ? input[0] : input) as Object3D
    iterateEntityNode(root.entity, (entity) => {
      if (!hasComponent(entity, MeshComponent)) return
      const mesh = getComponent(entity, MeshComponent)
      const removeMesh =
        hasComponent(entity, PrimitiveGeometryComponent) ||
        hasComponent(entity, GroundPlaneComponent) ||
        hasComponent(entity, ImageComponent) ||
        !!mesh.userData['ignoreOnExport']
      if (!removeMesh) return
      removeComponent(entity, MeshComponent)
    })
  }
}
