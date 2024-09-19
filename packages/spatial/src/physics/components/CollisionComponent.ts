
import { defineComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { ColliderHitEvent } from '../types/PhysicsTypes'

export const CollisionComponent = defineComponent({
  name: 'CollisionComponent',
  schema: S.Class(() => new Map<Entity, ColliderHitEvent>())
})
