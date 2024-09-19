import React, { useEffect, useRef } from 'react'
import { BufferAttribute, Mesh, SphereGeometry } from 'three'

import { useRender3DPanelSystem } from '@xrengine/client-core/src/user/components/Panel3D/useRender3DPanelSystem'
import {
  generateEntityUUID,
  getComponent,
  getMutableComponent,
  setComponent,
  useComponent,
  UUIDComponent
} from '@xrengine/ecs'
import { EnvmapComponent } from '@xrengine/engine/src/scene/components/EnvmapComponent'
import { MaterialSelectionState } from '@xrengine/engine/src/scene/materials/MaterialLibraryState'
import { getMutableState, getState, useHookstate } from '@xrengine/hyperflux'
import { CameraOrbitComponent } from '@xrengine/spatial/src/camera/components/CameraOrbitComponent'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { addObjectToGroup } from '@xrengine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import { MaterialStateComponent } from '@xrengine/spatial/src/renderer/materials/MaterialComponent'
import { getMaterial } from '@xrengine/spatial/src/renderer/materials/materialFunctions'
import { RendererComponent } from '@xrengine/spatial/src/renderer/WebGLRendererSystem'
import { MATERIALS_PANEL_ID } from './helpers'

function MaterialPreviewCanvas() {
  const panelRef = useRef() as React.MutableRefObject<HTMLCanvasElement>
  const renderPanel = useRender3DPanelSystem(panelRef)
  const selectedMaterial = useHookstate(getMutableState(MaterialSelectionState).selectedMaterial)
  const panel = document.getElementById(MATERIALS_PANEL_ID)
  const materialComponent = useComponent(UUIDComponent.getEntityByUUID(selectedMaterial.value!), MaterialStateComponent)

  useEffect(() => {
    if (!selectedMaterial.value) return
    const { sceneEntity, cameraEntity } = renderPanel
    setComponent(sceneEntity, NameComponent, 'Material Preview Entity')
    const uuid = generateEntityUUID()
    setComponent(sceneEntity, UUIDComponent, uuid)
    setComponent(sceneEntity, VisibleComponent, true)
    const material = getMaterial(getState(MaterialSelectionState).selectedMaterial!)
    if (!material) return
    const sphereMesh = new Mesh(new SphereGeometry(5, 32, 32), material)
    sphereMesh.geometry.attributes['color'] = new BufferAttribute(
      new Float32Array(sphereMesh.geometry.attributes.position.count * 3).fill(1),
      3
    )
    sphereMesh.geometry.attributes['uv1'] = sphereMesh.geometry.attributes['uv']
    addObjectToGroup(sceneEntity, sphereMesh)
    setComponent(sceneEntity, EnvmapComponent, { type: 'Skybox', envMapIntensity: 2 })
    const orbitCamera = getMutableComponent(cameraEntity, CameraOrbitComponent)
    orbitCamera.focusedEntities.set([sceneEntity])
    orbitCamera.refocus.set(true)
  }, [selectedMaterial, materialComponent.material])

  useEffect(() => {
    if (!panelRef?.current) return
    if (!panel) return
    getComponent(renderPanel.cameraEntity, RendererComponent).needsResize = true

    const observer = new ResizeObserver(() => {
      getComponent(renderPanel.cameraEntity, RendererComponent).needsResize = true
    })

    observer.observe(panel)

    return () => {
      observer.disconnect()
    }
  }, [panelRef])

  return (
    <>
      <div id="materialPreview" className="aspect-square h-full max-h-[200px] min-h-[100px] w-full">
        <canvas ref={panelRef} className="pointer-events-auto" />
      </div>
    </>
  )
}

export const MaterialPreviewer = () => {
  const selectedMaterial = useHookstate(getMutableState(MaterialSelectionState).selectedMaterial)
  if (!selectedMaterial.value) return null
  return (
    <div className="rounded-lg bg-zinc-800 p-2">
      <MaterialPreviewCanvas />
    </div>
  )
}
