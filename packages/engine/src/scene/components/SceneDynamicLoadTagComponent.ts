
import { useEffect } from 'react'

import { defineComponent, hasComponent, removeComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { CallbackComponent, setCallback } from '@xrengine/spatial/src/common/CallbackComponent'

const LoadTagModeSchema = S.LiteralUnion(['distance', 'trigger'], 'distance')

export const SceneDynamicLoadTagComponent = defineComponent({
  name: 'SceneDynamicLoadTagComponent',
  jsonID: 'XRENGINE_dynamic_load',

  schema: S.Object({
    mode: LoadTagModeSchema,
    distance: S.Number(20),
    loaded: S.Bool(false)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, SceneDynamicLoadTagComponent)

    /** Trigger mode */
    useEffect(() => {
      if (component.mode.value !== 'trigger') return

      function doLoad() {
        component.loaded.set(true)
      }

      function doUnload() {
        component.loaded.set(false)
      }

      if (hasComponent(entity, CallbackComponent)) {
        removeComponent(entity, CallbackComponent)
      }

      setCallback(entity, 'doLoad', doLoad)
      setCallback(entity, 'doUnload', doUnload)

      return () => {
        removeComponent(entity, CallbackComponent)
      }
    }, [component.mode])

    return null
  }
})
