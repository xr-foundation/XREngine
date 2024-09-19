
import { useEffect } from 'react'

import { defineComponent, useComponent, useEntityContext } from '@xrengine/ecs'
import { CameraOrbitComponent } from '@xrengine/spatial/src/camera/components/CameraOrbitComponent'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { ModelComponent } from '../../scene/components/ModelComponent'

export const AssetPreviewCameraComponent = defineComponent({
  name: 'AssetPreviewCameraComponent',

  schema: S.Object({
    targetModelEntity: S.Entity()
  }),

  reactor: () => {
    const entity = useEntityContext()
    const previewCameraComponent = useComponent(entity, AssetPreviewCameraComponent)
    const modelComponent = useComponent(previewCameraComponent.targetModelEntity.value, ModelComponent)
    const cameraOrbitComponent = useComponent(entity, CameraOrbitComponent)

    useEffect(() => {
      if (!modelComponent.scene.value) return
      cameraOrbitComponent.focusedEntities.set([previewCameraComponent.targetModelEntity.value])
      cameraOrbitComponent.refocus.set(true)
    }, [modelComponent.scene, cameraOrbitComponent])

    return null
  }
})
