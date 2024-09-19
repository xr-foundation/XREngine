
import { UndefinedEntity } from '@xrengine/ecs'
import { defineState } from '@xrengine/hyperflux'

export const EngineState = defineState({
  name: 'EngineState',
  initial: {
    /** @deprecated use isEditing instead */
    isEditor: false,
    isEditing: false,

    /**
     * Represents the reference space of the xr session local floor.
     */
    localFloorEntity: UndefinedEntity,

    /**
     * Represents the reference space for the absolute origin of the rendering context.
     */

    originEntity: UndefinedEntity,

    /**
     * Represents the reference space for the viewer.
     */
    viewerEntity: UndefinedEntity
  }
})
