

import './faceEnvWorkerPatch.js' // polyfill for face-api in webworker - MUST BE FIRST
import * as Comlink from 'comlink'
/** @todo reassess if we want to use this face-api package */
// import { detectSingleFace, nets, TinyFaceDetectorOptions } from '@vladmandic/face-api'

let canvas
let imageData
const faceApiOptions = new TinyFaceDetectorOptions()

Comlink.expose({
  initialise: async (BASE_URL) => {
    const origin = BASE_URL === '/client/' ? location.origin : BASE_URL
    await nets.tinyFaceDetector.loadFromUri(origin + '/facetracking')
    await nets.faceExpressionNet.loadFromUri(origin + '/facetracking')
  },
  create: (width, height) => {
    canvas = new OffscreenCanvas(width, height)
    imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
  },
  detect: async (pixels) => {
    if (canvas) {
      imageData.data.set(new Uint8ClampedArray(pixels))
      canvas.getContext('2d').putImageData(imageData, 0, 0)
      return await detectSingleFace(canvas, faceApiOptions).withFaceExpressions()
    }
    return
  }
})
