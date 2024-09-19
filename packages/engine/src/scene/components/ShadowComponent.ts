import { useEffect } from 'react'
import { Object3D } from 'three'

import { useEntityContext } from '@xrengine/ecs'
import { defineComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { GroupComponent } from '@xrengine/spatial/src/renderer/components/GroupComponent'

export const ShadowComponent = defineComponent({
  name: 'ShadowComponent',
  jsonID: 'XRENGINE_shadow',

  schema: S.Object({
    cast: S.Bool(true),
    receive: S.Bool(true)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const shadowComponent = useComponent(entity, ShadowComponent)
    const groupComponent = useComponent(entity, GroupComponent)

    useEffect(() => {
      for (const obj of groupComponent.value) {
        const object = obj as Object3D
        object.castShadow = shadowComponent.cast.value
        object.receiveShadow = shadowComponent.receive.value
      }
    }, [groupComponent, shadowComponent.cast, shadowComponent.receive])

    return null
  }
})
