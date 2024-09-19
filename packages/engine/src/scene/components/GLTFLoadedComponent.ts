import { ComponentType, defineComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'

export const GLTFLoadedComponent = defineComponent({
  name: 'GLTFLoadedComponent',
  schema: S.Array(S.Type<ComponentType<any>>())
})
