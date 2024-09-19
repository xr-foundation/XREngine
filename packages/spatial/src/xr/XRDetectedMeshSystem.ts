
import { useEffect } from 'react'

import { getComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { removeEntity } from '@xrengine/ecs/src/EntityFunctions'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { getMutableState, getState, useHookstate } from '@xrengine/hyperflux'

import { XRDetectedMeshComponent } from './XRDetectedMeshComponent'
import { XRDetectedPlaneComponent } from './XRDetectedPlaneComponent'
import { ReferenceSpace, XRState } from './XRState'
import { XRSystem } from './XRSystem'

/** https://github.com/immersive-web/webxr-samples/blob/main/proposals/plane-detection.html */

declare global {
  interface XRFrame {
    /** WebXR implements detectedPlanes on the XRFrame, but the current typescript implementation has it on worldInformation */
    detectedPlanes?: XRPlaneSet
  }

  interface XRPlane {
    semanticLabel?: string
  }
}

const handleDetectedPlanes = (frame: XRFrame) => {
  const detectedPlanes = frame.worldInformation?.detectedPlanes ?? frame.detectedPlanes
  if (!detectedPlanes) return

  for (const [plane, entity] of XRDetectedPlaneComponent.detectedPlanesMap) {
    if (!detectedPlanes.has(plane)) {
      removeEntity(entity)
      XRDetectedPlaneComponent.detectedPlanesMap.delete(plane)
      XRDetectedPlaneComponent.planesLastChangedTimes.delete(plane)
    }
  }

  for (const plane of detectedPlanes) {
    if (!XRDetectedPlaneComponent.detectedPlanesMap.has(plane)) {
      XRDetectedPlaneComponent.foundPlane(plane)
    }
    const entity = XRDetectedPlaneComponent.detectedPlanesMap.get(plane)!
    const lastKnownTime = XRDetectedPlaneComponent.planesLastChangedTimes.get(plane)!
    if (plane.lastChangedTime > lastKnownTime) {
      XRDetectedPlaneComponent.updatePlaneGeometry(entity, getComponent(entity, XRDetectedPlaneComponent).plane)
    }
    XRDetectedPlaneComponent.updatePlanePose(entity, plane)
  }
}

const handleDetectedMeshes = (frame: XRFrame) => {
  if (!frame.detectedMeshes) return

  for (const [mesh, entity] of XRDetectedMeshComponent.detectedMeshesMap) {
    if (!frame.detectedMeshes.has(mesh)) {
      removeEntity(entity)
      XRDetectedMeshComponent.detectedMeshesMap.delete(mesh)
      XRDetectedMeshComponent.meshesLastChangedTimes.delete(mesh)
    }
  }

  for (const mesh of frame.detectedMeshes) {
    if (!XRDetectedMeshComponent.detectedMeshesMap.has(mesh)) {
      XRDetectedMeshComponent.foundMesh(mesh)
    }
    const entity = XRDetectedMeshComponent.detectedMeshesMap.get(mesh)!
    const lastKnownTime = XRDetectedMeshComponent.meshesLastChangedTimes.get(mesh)!
    if (mesh.lastChangedTime > lastKnownTime) {
      XRDetectedMeshComponent.updateMeshGeometry(entity, getComponent(entity, XRDetectedMeshComponent).mesh)
    }
    XRDetectedMeshComponent.updateMeshPose(entity, mesh)
  }
}

const execute = () => {
  const frame = getState(XRState).xrFrame
  if (!frame?.session || frame.session.environmentBlendMode === 'opaque' || !ReferenceSpace.localFloor) return

  handleDetectedPlanes(frame)
  handleDetectedMeshes(frame)
}

const reactor = () => {
  const session = useHookstate(getMutableState(XRState).session)
  useEffect(() => {
    return () => {
      if (session.value) return
      for (const [, entity] of XRDetectedPlaneComponent.detectedPlanesMap) {
        removeEntity(entity)
      }
      XRDetectedPlaneComponent.detectedPlanesMap.clear()
      XRDetectedPlaneComponent.planesLastChangedTimes.clear()
      for (const [, entity] of XRDetectedMeshComponent.detectedMeshesMap) {
        removeEntity(entity)
      }
      XRDetectedMeshComponent.detectedMeshesMap.clear()
      XRDetectedMeshComponent.meshesLastChangedTimes.clear()
    }
  }, [session])
  return null
}

export const XRDetectedMeshSystem = defineSystem({
  uuid: 'xrengine.engine.XRDetectedMeshSystem',
  insert: { with: XRSystem },
  execute,
  reactor
})
