
import { getComponent, getOptionalComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { GroupComponent } from '@xrengine/spatial/src/renderer/components/GroupComponent'

import { ModelComponent } from '../../scene/components/ModelComponent'
import createGLTFExporter from './createGLTFExporter'

export default async function exportModelGLTF(
  entity: Entity,
  options = {
    projectName: '',
    relativePath: '',
    binary: true,
    includeCustomExtensions: true,
    embedImages: true,
    onlyVisible: false
  }
) {
  const scene = getOptionalComponent(entity, ModelComponent)?.scene ?? getComponent(entity, GroupComponent)[0]
  const exporter = createGLTFExporter()
  const modelName = options.relativePath.split('/').at(-1)!.split('.').at(0)!
  const resourceURI = `model-resources/${modelName}`
  const gltf: ArrayBuffer = await new Promise((resolve) => {
    exporter.parse(
      scene,
      (gltf: ArrayBuffer) => {
        resolve(gltf)
      },
      (error) => {
        throw error
      },
      {
        ...options,
        animations: scene.animations ?? [],
        flipY: !!scene.userData.src?.endsWith('.usdz'),
        resourceURI,
        srcEntity: entity
      }
    )
  })
  return gltf
}
