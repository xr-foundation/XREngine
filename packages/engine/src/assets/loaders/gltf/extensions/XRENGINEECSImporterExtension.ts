import { GLTF } from '@gltf-transform/core'

import { ComponentJSONIDMap } from '@xrengine/ecs/src/ComponentFunctions'

import { UUIDComponent, generateEntityUUID } from '@xrengine/ecs'
import { ComponentJsonType } from '../../../../scene/types/SceneTypes'
import { GLTFLoaderPlugin } from '../GLTFLoader'
import { ImporterExtension } from './ImporterExtension'

export type XRENGINE_ecs = {
  data: [string, any][]
}

export default class XRENGINEECSImporterExtension extends ImporterExtension implements GLTFLoaderPlugin {
  name = 'XRENGINE_ecs'

  beforeRoot() {
    const parser = this.parser
    const json: GLTF.IGLTF = parser.json
    const useVisible = !!json.extensionsUsed?.includes(this.name) || !!json.extensionsUsed?.includes('XRENGINE_visible')
    const nodeCount = json.nodes?.length || 0
    for (let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++) {
      const nodeDef = json.nodes![nodeIndex]

      if (useVisible) {
        nodeDef.extras ??= {}
        nodeDef.extras.useVisible = true
      }

      // CURRENT ECS EXTENSION FORMAT //
      const ecsExtensions: Record<string, any> = nodeDef.extensions ?? {}
      const componentJson: ComponentJsonType[] = []
      for (const jsonID of Object.keys(ecsExtensions)) {
        const component = ComponentJSONIDMap.get(jsonID)
        if (!component) {
          continue
        }
        //@todo: comprehensive solution to loading the same file multiple times
        if (component === UUIDComponent) {
          const uuid = ecsExtensions[jsonID]
          //check if uuid already exists
          if (UUIDComponent.entitiesByUUIDState[uuid]?.value) {
            //regenerate uuid if it already exists
            ecsExtensions[jsonID] = generateEntityUUID()
          }
        }
        const compData = ecsExtensions[jsonID]
        componentJson.push({
          name: jsonID,
          props: compData
        })
      }
      if (componentJson.length > 0) {
        nodeDef.extras ??= {}
        nodeDef.extras.componentJson = componentJson
      }
      // - //

      // LEGACY ECS EXTENSION FORMAT //
      if (!nodeDef.extensions?.[this.name]) continue
      const extensionDef: XRENGINE_ecs = nodeDef.extensions[this.name] as any
      const containsECSData = !!extensionDef.data && extensionDef.data.some(([k]) => k.startsWith('xrengine.'))
      if (!containsECSData) continue
      nodeDef.extras ??= {}
      nodeDef.extras.ecsData = extensionDef.data
      // - //
    }
    return null
  }
}
