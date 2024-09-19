import { Object3D } from 'three'

import { getAllComponents, getComponent, hasComponent, serializeComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'

import { SourceComponent } from '../../../../scene/components/SourceComponent'
import { GLTFExporterPlugin } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

export class XRENGINEECSExporterExtension extends ExporterExtension implements GLTFExporterPlugin {
  name = 'XRENGINE_ecs'

  writeNode(object: Object3D, nodeDef: { [key: string]: any }) {
    if (!object.entity) return
    const entity = object.entity
    if (!hasComponent(entity, SourceComponent)) return
    //const gltfLoaded = getComponent(entity, GLTFLoadedComponent)
    const components = getAllComponents(entity)
    if (hasComponent(entity, NameComponent)) {
      nodeDef.name = getComponent(entity, NameComponent)
    }
    for (const component of components) {
      if (
        component === TransformComponent ||
        component === TransformComponent || //skip transform data as that is stored in the object3d
        !component.jsonID //skip components that don't have a jsonID
      )
        continue
      const compData = serializeComponent(entity, component)
      if (!compData) continue
      const extensionName = component.jsonID
      nodeDef.extensions = nodeDef.extensions ?? {}
      nodeDef.extensions[extensionName] = compData
      this.writer.extensionsUsed[extensionName] = true
    }
    this.writer.extensionsUsed[this.name] = true
  }
}
