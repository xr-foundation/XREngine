import { UUIDComponent } from '@xrengine/ecs'
import { getComponent, getOptionalComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { defineQuery } from '@xrengine/ecs/src/QueryFunctions'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { CallbackComponent } from '@xrengine/spatial/src/common/CallbackComponent'
import { CollisionComponent } from '@xrengine/spatial/src/physics/components/CollisionComponent'
import { PhysicsSystem } from '@xrengine/spatial/src/physics/systems/PhysicsSystem'
import { ColliderHitEvent, CollisionEvents } from '@xrengine/spatial/src/physics/types/PhysicsTypes'

import { TriggerComponent } from '../components/TriggerComponent'

export const triggerEnter = (triggerEntity: Entity, otherEntity: Entity, hit: ColliderHitEvent) => {
  const triggerComponent = getComponent(triggerEntity, TriggerComponent)
  for (const trigger of triggerComponent.triggers) {
    if (trigger.target && !UUIDComponent.getEntityByUUID(trigger.target)) continue
    const targetEntity = trigger.target ? UUIDComponent.getEntityByUUID(trigger.target) : triggerEntity
    if (targetEntity && trigger.onEnter) {
      const callbacks = getOptionalComponent(targetEntity, CallbackComponent)
      if (!callbacks) continue
      callbacks.get(trigger.onEnter)?.(triggerEntity, otherEntity)
    }
  }
}

export const triggerExit = (triggerEntity: Entity, otherEntity: Entity, hit: ColliderHitEvent) => {
  const triggerComponent = getComponent(triggerEntity, TriggerComponent)
  for (const trigger of triggerComponent.triggers) {
    if (trigger.target && !UUIDComponent.getEntityByUUID(trigger.target)) continue
    const targetEntity = trigger.target ? UUIDComponent.getEntityByUUID(trigger.target) : triggerEntity
    if (targetEntity && trigger.onExit) {
      const callbacks = getOptionalComponent(targetEntity, CallbackComponent)
      if (!callbacks) continue
      callbacks.get(trigger.onExit)?.(triggerEntity, otherEntity)
    }
  }
}

const collisionQuery = defineQuery([TriggerComponent, CollisionComponent])

const execute = () => {
  for (const entity of collisionQuery()) {
    for (const [e, hit] of getComponent(entity, CollisionComponent)) {
      if (hit.type === CollisionEvents.TRIGGER_START) {
        triggerEnter(entity, e, hit)
      }
      if (hit.type === CollisionEvents.TRIGGER_END) {
        triggerExit(entity, e, hit)
      }
    }
  }
}

export const TriggerSystem = defineSystem({
  uuid: 'xrengine.engine.TriggerSystem',
  insert: { with: PhysicsSystem },
  execute
})
