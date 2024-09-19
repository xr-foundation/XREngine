
import { useEntityContext } from '@xrengine/ecs'
import { defineComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import type { WebContainer3D } from '@xrengine/xrui'
import { useLayoutEffect } from 'react'

export const XRUIComponent = defineComponent({
  name: 'XRUIComponent',
  schema: S.Type<WebContainer3D>(),

  reactor: () => {
    const entity = useEntityContext()
    const xruiComponent = useComponent(entity, XRUIComponent)

    useLayoutEffect(() => {
      const xrui = xruiComponent.value
      return () => {
        xrui.destroy()
      }
    }, [])

    return null
  }
})
