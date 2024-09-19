
import { debounce } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineCamera } from 'react-icons/hi'

import { getComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Engine } from '@xrengine/ecs/src/Engine'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'

import { EditorComponentType } from '@xrengine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@xrengine/editor/src/functions/EditorControlFunctions'
import { previewScreenshot } from '@xrengine/editor/src/functions/takeScreenshot'
import { ScenePreviewCameraComponent } from '@xrengine/engine/src/scene/components/ScenePreviewCamera'
import { getState } from '@xrengine/hyperflux'
import { EngineState } from '@xrengine/spatial/src/EngineState'
import {
  RendererComponent,
  getNestedVisibleChildren,
  getSceneParameters
} from '@xrengine/spatial/src/renderer/WebGLRendererSystem'
import { computeTransformMatrix } from '@xrengine/spatial/src/transform/systems/TransformSystem'
import { Scene } from 'three'
import Button from '../../../../../primitives/tailwind/Button'
import ImagePreviewInput from '../../../input/Image/Preview'
import NodeEditor from '../../nodeEditor'

/**
 * ScenePreviewCameraNodeEditor provides the editor view to customize properties.
 */

const scene = new Scene()

export const ScenePreviewCameraNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const [bufferUrl, setBufferUrl] = useState<string>('')
  const transformComponent = useComponent(Engine.instance.cameraEntity, TransformComponent)

  const onSetFromViewport = () => {
    const { position, rotation } = getComponent(Engine.instance.cameraEntity, TransformComponent)
    const transform = getComponent(props.entity, TransformComponent)
    transform.position.copy(position)
    transform.rotation.copy(rotation)
    computeTransformMatrix(props.entity)

    EditorControlFunctions.commitTransformSave([props.entity])
  }

  const updateScenePreview = async () => {
    const rootEntity = getState(EngineState).viewerEntity
    const entitiesToRender = getComponent(rootEntity, RendererComponent).scenes.map(getNestedVisibleChildren).flat()
    const { background, environment, fog, children } = getSceneParameters(entitiesToRender)

    scene.children = children
    scene.environment = environment
    scene.fog = fog
    scene.background = background

    const imageBlob = (await previewScreenshot(
      512 / 2,
      320 / 2,
      0.9,
      'jpeg',
      scene,
      getComponent(props.entity, ScenePreviewCameraComponent).camera
    ))!
    const url = URL.createObjectURL(imageBlob)
    setBufferUrl(url)
  }

  const updateCubeMapBakeDebounced = useCallback(debounce(updateScenePreview, 500), []) //ms

  useEffect(() => {
    updateCubeMapBakeDebounced()
    return () => {
      updateCubeMapBakeDebounced.cancel()
    }
  }, [transformComponent.position])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.sceneCamera.name')}
      description={t('editor:properties.sceneCamera.description')}
      icon={<ScenePreviewCameraNodeEditor.iconComponent />}
    >
      <ImagePreviewInput value={bufferUrl} />
      <div className="flex h-auto flex-col items-center">
        <Button
          onClick={() => {
            onSetFromViewport()
            updateScenePreview()
          }}
        >
          {t('editor:properties.sceneCamera.lbl-setFromViewPort')}
        </Button>
      </div>
    </NodeEditor>
  )
}

ScenePreviewCameraNodeEditor.iconComponent = HiOutlineCamera

export default ScenePreviewCameraNodeEditor
