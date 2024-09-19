import { ComponentJSONIDMap } from '@xrengine/ecs'

import { SceneJsonType } from '../types/SceneTypes'

export const migrateOldComponentJSONIDs = (json: SceneJsonType) => {
  for (const [uuid, entityJson] of Object.entries(json.entities)) {
    for (const component of entityJson.components) {
      if (component.name.startsWith('XRENGINE_') || component.name === 'collider') continue

      const newJsonID = 'XRENGINE_' + component.name.replace('-', '_')

      const newComponent = ComponentJSONIDMap.has(newJsonID)
      if (!newComponent) continue

      console.log('Migrating old component', component.name, 'to', newJsonID)
      component.name = newJsonID
    }
  }
}
