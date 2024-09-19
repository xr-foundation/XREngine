
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'

import { XRSystem } from './XRSystem'

/**
 * https://github.com/immersive-web/raw-camera-access/blob/main/explainer.md
 */

declare global {
  interface XRView {
    camera: XRCamera
  }

  interface XRCamera {
    width: number
    height: number
  }

  interface XRWebGLBinding {
    getCameraImage(camera: XRCamera): WebGLTexture
  }
}

/** @todo - do something with camera API */

// const execute = () => {
// const xrRendererState = getState(XRRendererState)
//   if (getState(XRState).xrFrame && ReferenceSpace.localFloor) {
//     const viewer = getState(XRState).xrFrame.getViewerPose(ReferenceSpace.localFloor)
//     if (viewer) {
//       for (const view of viewer.views) {
//         // console.log('XRCamera supported:', view.camera !== null && xrRendererState.glBinding !== null)
//         if (view.camera && xrRendererState.glBinding) {
//           const cameraImage = xrRendererState.glBinding?.getCameraImage(view.camera)
//           // console.log('WebGLTexture:', cameraImage)
//         }
//       }
//     }
//   }
// }

const execute = () => {}

export const XRCameraViewSystem = defineSystem({
  uuid: 'xrengine.engine.XRCameraViewSystem',
  insert: { with: XRSystem },
  execute
})
