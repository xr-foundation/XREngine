import { t } from 'i18next'
import React, { useEffect, useRef } from 'react'

import { useRender3DPanelSystem } from '@xrengine/client-core/src/user/components/Panel3D/useRender3DPanelSystem'
import { createEntity, removeComponent, removeEntity, setComponent } from '@xrengine/ecs'
import { AssetPreviewCameraComponent } from '@xrengine/engine/src/camera/components/AssetPreviewCameraComponent'
import { EnvmapComponent } from '@xrengine/engine/src/scene/components/EnvmapComponent'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'
import { useHookstate } from '@xrengine/hyperflux'
import { AmbientLightComponent, TransformComponent } from '@xrengine/spatial'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'
import LoadingView from '@xrengine/ui/src/primitives/tailwind/LoadingView'

import styles from '../styles.module.scss'

export const ModelPreviewPanel = (props) => {
  const url = props.resourceProps.resourceUrl
  const loading = useHookstate(true)

  const error = useHookstate('')
  const panelRef = useRef() as React.MutableRefObject<HTMLCanvasElement>
  const renderPanel = useRender3DPanelSystem(panelRef)

  useEffect(() => {
    const { sceneEntity, cameraEntity } = renderPanel
    setComponent(sceneEntity, NameComponent, '3D Preview Entity')
    setComponent(sceneEntity, ModelComponent, { src: url, cameraOcclusion: false })
    setComponent(sceneEntity, EnvmapComponent, { type: 'Skybox', envMapIntensity: 2 }) // todo remove when lighting works
    setComponent(cameraEntity, AssetPreviewCameraComponent, { targetModelEntity: sceneEntity })

    const lightEntity = createEntity()
    setComponent(lightEntity, AmbientLightComponent)
    setComponent(lightEntity, TransformComponent)
    setComponent(lightEntity, VisibleComponent)
    setComponent(lightEntity, NameComponent, 'Ambient Light')
    setComponent(lightEntity, EntityTreeComponent, { parentEntity: sceneEntity })
    loading.set(false)

    return () => {
      loading.set(true)
      removeComponent(sceneEntity, ModelComponent)
      removeComponent(sceneEntity, EnvmapComponent)
      removeComponent(cameraEntity, AssetPreviewCameraComponent)
      removeEntity(lightEntity)
    }
  }, [url])

  return (
    <>
      {loading.value && <LoadingView className="h-6 w-6" title={t('common:loader.loading')} />}
      {error.value && (
        <div className={styles.container}>
          <h1 className={styles.error}>{error.value}</h1>
        </div>
      )}
      <div id="modelPreview" style={{ width: '100%', height: '100%' }}>
        <canvas ref={panelRef} style={{ width: '100%', height: '100%', pointerEvents: 'all' }} />
      </div>
    </>
  )
}
