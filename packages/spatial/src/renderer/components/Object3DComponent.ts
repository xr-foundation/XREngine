import { Object3D } from 'three'

import { defineComponent, useComponent, useEntityContext, useOptionalComponent } from '@xrengine/ecs'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { NO_PROXY, useImmediateEffect } from '@xrengine/hyperflux'
import { NameComponent } from '../../common/NameComponent'

export const Object3DComponent = defineComponent({
  name: 'Object3DComponent',
  jsonID: 'XRENGINE_object3d',
  schema: S.Required(S.NonSerialized(S.Type<Object3D>())),

  reactor: () => {
    const entity = useEntityContext()
    const object3DComponent = useComponent(entity, Object3DComponent)
    const nameComponent = useOptionalComponent(entity, NameComponent)

    useImmediateEffect(() => {
      if (!nameComponent) return
      const object = object3DComponent.get(NO_PROXY) as Object3D
      object.name = nameComponent.value
    }, [nameComponent?.value])

    return null
  }
})
