import { Quaternion, Vector3 } from 'three'

import { dispatchAction } from '@xrengine/hyperflux'

import { PersistentAnchorActions } from '../XRAnchorComponents'
import { XR8 } from './XR8'
import {
  CameraPipelineModule,
  WayspotFoundEvent,
  WayspotLostEvent,
  WayspotScanningEvent,
  WayspotUpdatedEvent
} from './XR8Types'

/**
 * Orients the camera canvas according to 8th wall's internal orientation and the window
 * Updates the camera orientation according to 8th wall's world tracking
 * Hooks up Lightship VPS to XREngine VPS abstraction
 * @param world
 * @param cameraCanvas
 * @returns {CameraPipelineModule}
 */
export const XR8Pipeline = (cameraCanvas: HTMLCanvasElement): CameraPipelineModule => {
  const orientCameraFeed = function (orientation: number) {
    /** orientation can take a frame or two to complete, so wait until it matches what 8th wall expects */
    const needsUpdate =
      ((orientation === 0 || orientation === 180) && window.innerWidth > window.innerHeight) ||
      ((orientation === 90 || orientation === -90) && window.innerHeight > window.innerWidth)
    if (needsUpdate) {
      window.requestAnimationFrame(function () {
        return orientCameraFeed(orientation)
      })
    } else {
      cameraCanvas.width = window.innerWidth
      cameraCanvas.height = window.innerHeight
    }
  }

  const onWayspotScanning = (event: WayspotScanningEvent) => {
    console.log(event)
  }

  const onWayspotFound = (event: WayspotFoundEvent) => {
    const { name, position, rotation } = event.detail
    dispatchAction(
      PersistentAnchorActions.anchorFound({ name, position: position as Vector3, rotation: rotation as Quaternion })
    )
  }

  const onWayspotUpdated = (event: WayspotUpdatedEvent) => {
    const { name, position, rotation } = event.detail
    dispatchAction(
      PersistentAnchorActions.anchorUpdated({ name, position: position as Vector3, rotation: rotation as Quaternion })
    )
  }

  const onWayspotLost = (event: WayspotLostEvent) => {
    const { name } = event.detail
    dispatchAction(PersistentAnchorActions.anchorLost({ name }))
  }

  return {
    name: 'XRENGINE_CameraPipeline',
    onAttach: ({ canvas, orientation }) => {
      orientCameraFeed(orientation)
    },
    onDeviceOrientationChange: ({ orientation }) => {
      orientCameraFeed(orientation)
    },
    onStart: () => {
      const { camera, renderer } = XR8.Threejs.xrScene()
      renderer.render = (scene, camera) => {
        /** disable the 8thwall threejs renderer */
      }
      /** sync camera */
      XR8.XrController.updateCameraProjectionMatrix({
        origin: camera.position,
        facing: camera.quaternion
      })
      const watcher = XR8.Vps.makeWayspotWatcher({
        onVisible: () => {},
        onHidden: () => {},
        pollGps: true,
        lat: 0,
        lng: 0
      })
    },
    // onUpdate: (props) => {
    //   const { processCpuResult } = props
    //   // console.log(processCpuResult)
    //   if (processCpuResult.reality) {
    //     /** @todo support lighting */
    //   }
    // }
    listeners: [
      { event: 'reality.projectwayspotfound', process: onWayspotFound },
      { event: 'reality.projectwayspotscanning', process: onWayspotScanning },
      { event: 'reality.projectwayspotlost', process: onWayspotLost },
      { event: 'reality.projectwayspotupdated', process: onWayspotUpdated }
      // { event: 'reality.meshfound', process: onMeshFound },
      // { event: 'reality.meshupdated', process: onMeshUpdate },
      // { event: 'reality.meshlost', process: onMeshLost }
    ]
  }
}
