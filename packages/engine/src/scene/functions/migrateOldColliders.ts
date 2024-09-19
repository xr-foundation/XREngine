import { ColliderComponent } from '@xrengine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@xrengine/spatial/src/physics/components/RigidBodyComponent'
import { TriggerComponent } from '@xrengine/spatial/src/physics/components/TriggerComponent'

import { ModelComponent } from '../components/ModelComponent'
import { ComponentJsonType, EntityJsonType } from '../types/SceneTypes'

const oldColliderJSONID = 'collider'

/**
 * Converts old ColliderComponent to RigidbodyComponent, new ColliderComponent and TriggerComponent
 */
export const migrateOldColliders = (oldJSON: EntityJsonType) => {
  /** models need to be manually converted in the studio */
  const hasModel = Object.values(oldJSON.components).some((comp) => comp.name === ModelComponent.jsonID)
  if (hasModel) return

  const newComponents = [] as ComponentJsonType[]
  for (const component of oldJSON.components) {
    if (component.name !== oldColliderJSONID) continue

    const data = component.props
    newComponents.push({
      name: RigidBodyComponent.jsonID,
      props: {
        type:
          data.bodyType === 1 || data.bodyType === 'Fixed'
            ? 'fixed'
            : data.bodyType === 0 || data.bodyType === 'Dynamic'
            ? 'dynamic'
            : 'kinematic'
      }
    })
    if (typeof data.shapeType === 'number')
      newComponents.push({
        name: ColliderComponent.jsonID,
        props: {
          shape: data.shapeType,
          collisionLayer: data.collisionLayer,
          collisionMask: data.collisionMask,
          restitution: data.restitution
        }
      })
    if (data.isTrigger) {
      newComponents.push({
        name: TriggerComponent.jsonID,
        props: { triggers: data.triggers }
      })
    }
  }

  if (!newComponents.length) return

  oldJSON.components.push(...newComponents)
  oldJSON.components = oldJSON.components.filter((component) => component.name !== oldColliderJSONID)
}
