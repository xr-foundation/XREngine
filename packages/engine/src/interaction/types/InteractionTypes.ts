import { Entity } from '@xrengine/ecs/src/Entity'

export type InteractionCheckHandler = (
  clientEntity: Entity,
  interactableEntity: Entity,
  focusedPart?: number,
  args?: any
) => boolean
