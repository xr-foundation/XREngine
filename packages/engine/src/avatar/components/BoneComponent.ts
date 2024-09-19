import { Bone } from 'three'

import { defineComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'

export const BoneComponent = defineComponent({
  name: 'BoneComponent',

  schema: S.Required(S.Type<Bone>()),

  onSet: (entity, component, mesh: Bone) => {
    if (!mesh || !mesh.isBone) throw new Error('BoneComponent: Invalid bone')
    component.set(mesh)
  }
})
