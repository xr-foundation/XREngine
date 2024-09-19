import { defineComponent } from '@xrengine/ecs'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'

export const CameraOrbitComponent = defineComponent({
  name: 'CameraOrbitComponent',

  schema: S.Object({
    focusedEntities: S.Array(S.Entity()),
    isPanning: S.Bool(false),
    cursorDeltaX: S.Number(0),
    cursorDeltaY: S.Number(0),
    minimumZoom: S.Number(0.1),
    isOrbiting: S.Bool(false),
    refocus: S.Bool(false),
    cameraOrbitCenter: S.Vec3(),
    disabled: S.Bool(false)
  })
})
