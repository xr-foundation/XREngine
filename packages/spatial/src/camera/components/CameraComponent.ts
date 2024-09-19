import { ArrayCamera, PerspectiveCamera } from 'three'

import { useEntityContext } from '@xrengine/ecs'
import { defineComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { useImmediateEffect } from '@xrengine/hyperflux'
import { addObjectToGroup, removeObjectFromGroup } from '../../renderer/components/GroupComponent'

export const CameraComponent = defineComponent({
  name: 'CameraComponent',
  jsonID: 'XRENGINE_camera',

  schema: S.Object({
    fov: S.Number(60),
    aspect: S.Number(1),
    near: S.Number(0.1),
    far: S.Number(1000)
  }),

  onInit: (initial) => new ArrayCamera([new PerspectiveCamera(initial.fov, initial.aspect, initial.near, initial.far)]),

  reactor: () => {
    const entity = useEntityContext()
    const cameraComponent = useComponent(entity, CameraComponent)

    useImmediateEffect(() => {
      const camera = cameraComponent.value as ArrayCamera
      addObjectToGroup(entity, camera)
      return () => {
        removeObjectFromGroup(entity, camera)
      }
    }, [])
    return null
  }
})
