import React, { useEffect } from 'react'

import {
  EntityUUID,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  generateEntityUUID,
  hasComponent,
  setComponent
} from '@xrengine/ecs'
import { useHookstate } from '@xrengine/hyperflux'
import { TransformComponent } from '@xrengine/spatial'
import { CameraComponent } from '@xrengine/spatial/src/camera/components/CameraComponent'
import { CameraOrbitComponent } from '@xrengine/spatial/src/camera/components/CameraOrbitComponent'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { InputComponent } from '@xrengine/spatial/src/input/components/InputComponent'
import { RendererComponent, initializeEngineRenderer } from '@xrengine/spatial/src/renderer/WebGLRendererSystem'
import { VisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import {
  EntityTreeComponent,
  removeEntityNodeRecursively
} from '@xrengine/spatial/src/transform/components/EntityTree'

export function useRender3DPanelSystem(canvas: React.MutableRefObject<HTMLCanvasElement>) {
  const canvasRef = useHookstate(canvas.current)

  const panelState = useHookstate(() => {
    const sceneEntity = createEntity()
    const uuid = generateEntityUUID()
    setComponent(sceneEntity, UUIDComponent, (uuid + '-scene') as EntityUUID)
    setComponent(sceneEntity, TransformComponent)
    setComponent(sceneEntity, VisibleComponent)
    setComponent(sceneEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })

    const cameraEntity = createEntity()
    setComponent(cameraEntity, UUIDComponent, (uuid + '-camera') as EntityUUID)
    setComponent(cameraEntity, CameraComponent)
    setComponent(cameraEntity, TransformComponent)
    setComponent(cameraEntity, VisibleComponent)
    setComponent(cameraEntity, CameraOrbitComponent, { refocus: true })
    setComponent(cameraEntity, InputComponent)
    setComponent(cameraEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })

    return {
      cameraEntity,
      sceneEntity
    }
  })

  useEffect(() => {
    const { cameraEntity, sceneEntity } = panelState.value
    return () => {
      // cleanup entities and state associated with this 3d panel
      removeEntityNodeRecursively(cameraEntity)
      removeEntityNodeRecursively(sceneEntity)
    }
  }, [])

  useEffect(() => {
    if (!canvas.current || canvasRef.value === canvas.current) return
    canvasRef.set(canvas.current)

    const { cameraEntity, sceneEntity } = panelState.value

    setComponent(cameraEntity, NameComponent, '3D Preview Camera for ' + canvasRef.value.id)

    if (hasComponent(cameraEntity, RendererComponent)) return

    setComponent(cameraEntity, RendererComponent, {
      canvas: canvasRef.value as HTMLCanvasElement,
      scenes: [sceneEntity]
    })
    initializeEngineRenderer(cameraEntity)
  }, [canvas.current])

  return panelState.value
}
