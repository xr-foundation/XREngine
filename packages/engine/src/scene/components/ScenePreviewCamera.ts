
import { useLayoutEffect } from 'react'
import { PerspectiveCamera } from 'three'

import { useExecute } from '@xrengine/ecs'
import {
  defineComponent,
  getComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { Engine } from '@xrengine/ecs/src/Engine'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { getMutableState, useHookstate } from '@xrengine/hyperflux'
import { CameraHelperComponent } from '@xrengine/spatial/src/common/debug/CameraHelperComponent'
import { RendererState } from '@xrengine/spatial/src/renderer/RendererState'
import { addObjectToGroup, removeObjectFromGroup } from '@xrengine/spatial/src/renderer/components/GroupComponent'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'
import { TransformDirtyCleanupSystem } from '@xrengine/spatial/src/transform/systems/TransformSystem'

export const ScenePreviewCameraComponent = defineComponent({
  name: 'XRENGINE_scenePreviewCamera',
  jsonID: 'XRENGINE_scene_preview_camera',

  schema: S.Object({
    camera: S.Class(() => new PerspectiveCamera(80, 16 / 9, 0.2, 8000))
  }),

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)
    const previewCamera = useComponent(entity, ScenePreviewCameraComponent)
    const previewCameraTransform = useComponent(entity, TransformComponent)
    const engineCameraTransform = useComponent(Engine.instance.cameraEntity, TransformComponent)

    useLayoutEffect(() => {
      const transform = getComponent(entity, TransformComponent)
      const cameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)
      cameraTransform.position.copy(transform.position)
      cameraTransform.rotation.copy(transform.rotation)
      const camera = previewCamera.camera.value as PerspectiveCamera
      addObjectToGroup(entity, camera)
      return () => {
        removeObjectFromGroup(entity, camera)
      }
    }, [])

    useExecute(
      () => {
        if (!TransformComponent.dirtyTransforms[entity]) return
        const camera = getComponent(entity, ScenePreviewCameraComponent).camera
        camera.matrixWorldInverse.copy(camera.matrixWorld).invert()
      },
      { before: TransformDirtyCleanupSystem }
    )

    useLayoutEffect(() => {
      engineCameraTransform.position.value.copy(previewCameraTransform.position.value)
      engineCameraTransform.rotation.value.copy(previewCameraTransform.rotation.value)
    }, [previewCameraTransform])

    useLayoutEffect(() => {
      if (debugEnabled.value) {
        setComponent(entity, CameraHelperComponent, {
          name: 'scene-preview-helper',
          camera: previewCamera.camera.value as PerspectiveCamera
        })
      }
      return () => {
        removeComponent(entity, CameraHelperComponent)
      }
    }, [debugEnabled])

    return null
  }
})
