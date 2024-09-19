
import { Entity, EntityUUID, getComponent, hasComponent } from '@xrengine/ecs'
import { MaterialInstanceComponent } from '@xrengine/spatial/src/renderer/materials/MaterialComponent'

import { SourceComponent } from '../../components/SourceComponent'
import { getModelSceneID } from '../../functions/loaders/ModelFunctions'

/**Gets all materials used by child and self entity */
export const getMaterialsFromScene = (source: Entity) => {
  const sceneInstanceID = getModelSceneID(source)
  const childEntities = SourceComponent.entitiesBySource[sceneInstanceID] ?? ([] as Entity[])
  childEntities.push(source)
  const materials = {} as Record<EntityUUID, Entity>
  for (const entity of childEntities) {
    if (hasComponent(entity, MaterialInstanceComponent)) {
      const materialComponent = getComponent(entity, MaterialInstanceComponent)
      for (const mat of materialComponent.uuid!) {
        materials[mat] = entity
      }
    }
  }
  return Object.keys(materials) as any as EntityUUID[]
}
