
import { InstancedBufferAttribute } from 'three'

import { defineComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'

export const InstancingComponent = defineComponent({
  name: 'InstancingComponent',
  jsonID: 'XRENGINE_instancing',

  schema: S.Object({
    instanceMatrix: S.Class(() => new InstancedBufferAttribute(new Float32Array(16), 16))
  })
})
