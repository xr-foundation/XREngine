import './patchNodeForWebXREmulator'

import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer'

import { Entity, getMutableComponent, setComponent } from '@xrengine/ecs'
import { EffectComposer, Pass, RenderPass } from 'postprocessing'
import { WebGLRenderTarget } from 'three'
import { RendererComponent } from '../../src/renderer/WebGLRendererSystem'
import { createWebXRManager } from '../../src/xr/WebXRManager'
import { MockEventListener } from './MockEventListener'

class MockCanvas extends MockEventListener {
  #context = {
    getContextAttributes: () => {
      return {
        xrCompatible: true
      }
    },
    viewport: () => {}
  }
  parentElement = new MockEventListener()
  getContext = () => this.#context
}

class MockRenderer {
  cancelAnimationFrame = () => {}
  setAnimationLoop = () => {}
  animation = {
    start: () => {},
    stop: () => {},
    setAnimationLoop: () => {},
    setContext: () => {}
  }
  domElement = new MockCanvas()
  setPixelRatio = () => {}
  getRenderTarget = () => {}
  getSize = () => 0
  getContext = () => this.domElement.getContext()
  getPixelRatio = () => 1
  dispose = () => {}
}

class MockEffectComposer extends EffectComposer {
  constructor(renderer?: MockRenderer) {
    super(renderer as unknown as WebGLRenderer)
  }
  addPass(pass: Pass, index?: number | undefined): void {
    const passes = this.passes
    if (index !== undefined) {
      passes.splice(index, 0, pass)
    } else {
      passes.push(pass)
    }
  }
  render = () => {}
  setSize = () => {}
  getSize = () => 0
  setRenderer = () => {}
  replaceRenderer = () => this.getRenderer()
  createDepthTexture = () => {}
  createBuffer = () => new WebGLRenderTarget()
}

export const mockEngineRenderer = (entity: Entity) => {
  const renderer = new MockRenderer() as unknown as WebGLRenderer
  setComponent(entity, RendererComponent)
  const effectComposer = new MockEffectComposer()
  const renderPass = new RenderPass()
  effectComposer.addPass(renderPass)
  const xrManager = createWebXRManager(renderer)
  xrManager.cameraAutoUpdate = false
  xrManager.enabled = true
  getMutableComponent(entity, RendererComponent).merge({
    supportWebGL2: true,
    canvas: renderer.domElement,
    renderContext: renderer.getContext(),
    renderer,
    effectComposer,
    renderPass,
    xrManager
  })
  // run reactor
  setComponent(entity, RendererComponent)
}
