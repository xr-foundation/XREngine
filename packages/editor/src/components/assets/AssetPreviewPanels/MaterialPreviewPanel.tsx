
import React, { useEffect, useRef } from 'react'
import { Mesh, SphereGeometry } from 'three'

import { useRender3DPanelSystem } from '@xrengine/client-core/src/user/components/Panel3D/useRender3DPanelSystem'
import { generateEntityUUID, getMutableComponent, setComponent, useComponent, UUIDComponent } from '@xrengine/ecs'
import { EnvmapComponent } from '@xrengine/engine/src/scene/components/EnvmapComponent'
import { MaterialSelectionState } from '@xrengine/engine/src/scene/materials/MaterialLibraryState'
import { getState, useMutableState } from '@xrengine/hyperflux'
import { CameraOrbitComponent } from '@xrengine/spatial/src/camera/components/CameraOrbitComponent'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { addObjectToGroup } from '@xrengine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import { MaterialStateComponent } from '@xrengine/spatial/src/renderer/materials/MaterialComponent'
import { getMaterial } from '@xrengine/spatial/src/renderer/materials/materialFunctions'

export const MaterialPreviewCanvas = () => {
  const panelRef = useRef() as React.MutableRefObject<HTMLCanvasElement>
  const renderPanel = useRender3DPanelSystem(panelRef)
  const selectedMaterial = useMutableState(MaterialSelectionState).selectedMaterial
  useEffect(() => {
    if (!selectedMaterial.value) return
    const { sceneEntity, cameraEntity } = renderPanel
    setComponent(sceneEntity, NameComponent, 'Material Preview Entity')
    const uuid = generateEntityUUID()
    setComponent(sceneEntity, UUIDComponent, uuid)
    setComponent(sceneEntity, VisibleComponent, true)
    const material = getMaterial(getState(MaterialSelectionState).selectedMaterial!)
    if (!material) return
    addObjectToGroup(sceneEntity, new Mesh(new SphereGeometry(5, 32, 32), material))
    setComponent(sceneEntity, EnvmapComponent, { type: 'Skybox', envMapIntensity: 2 })
    const orbitCamera = getMutableComponent(cameraEntity, CameraOrbitComponent)
    orbitCamera.focusedEntities.set([sceneEntity])
    orbitCamera.refocus.set(true)
  }, [
    selectedMaterial,
    useComponent(UUIDComponent.getEntityByUUID(selectedMaterial.value!), MaterialStateComponent).material
  ])
  return (
    <>
      <div id="materialPreview" style={{ minHeight: '200px', width: '100%', height: '100%' }}>
        <canvas ref={panelRef} style={{ pointerEvents: 'all' }} />
      </div>
    </>
  )
}

export const MaterialPreviewPanel = (props) => {
  const selectedMaterial = useMutableState(MaterialSelectionState).selectedMaterial
  if (!selectedMaterial.value) return null
  return <MaterialPreviewCanvas key={selectedMaterial.value} />
}
