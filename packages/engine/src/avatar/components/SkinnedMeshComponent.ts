import { SkinnedMesh } from 'three'

import { defineComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'

export const SkinnedMeshComponent = defineComponent({
  name: 'SkinnedMeshComponent',

  schema: S.Type<SkinnedMesh>(),

  onSet: (entity, component, mesh: SkinnedMesh) => {
    if (!mesh || !mesh.isSkinnedMesh) throw new Error('SkinnedMeshComponent: Invalid skinned mesh')
    component.set(mesh)
  }
})
