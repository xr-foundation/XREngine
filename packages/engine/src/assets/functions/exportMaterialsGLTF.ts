import { BufferGeometry, Material, Mesh, Scene } from 'three'

import { Entity, getComponent } from '@xrengine/ecs'
import { MaterialStateComponent } from '@xrengine/spatial/src/renderer/materials/MaterialComponent'

import { GLTFExporterOptions } from '../exporters/gltf/GLTFExporter'
import createGLTFExporter from './createGLTFExporter'

export default async function exportMaterialsGLTF(
  materialEntities: Entity[],
  options: GLTFExporterOptions
): Promise<ArrayBuffer | { [key: string]: any } | undefined> {
  if (materialEntities.length === 0) return
  const scene = new Scene()
  scene.name = 'Root'
  const dudGeo = new BufferGeometry()
  dudGeo.groups = materialEntities.map((_, i) => ({ count: 0, start: 0, materialIndex: i }))
  const materials = materialEntities.map((entity) => getComponent(entity, MaterialStateComponent).material as Material)
  const lib = new Mesh(dudGeo, materials)
  lib.name = 'Materials'
  scene.add(lib)
  const exporter = createGLTFExporter()
  const gltf = await new Promise<ArrayBuffer | { [key: string]: any }>((resolve) => {
    exporter.parse(
      scene,
      resolve,
      (e) => {
        throw e
      },
      {
        ...options,
        embedImages: options.binary,
        includeCustomExtensions: true
      }
    )
  })

  return gltf
}
