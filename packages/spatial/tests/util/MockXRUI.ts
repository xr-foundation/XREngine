


import { Entity, setComponent } from '@xrengine/ecs'
import { Bounds, Edges, WebContainer3D, WebLayerManager } from '@xrengine/xrui'
import { XRUIComponent } from '../../src/xrui/components/XRUIComponent'

/**
 * @why
 * Required for mocking XRUI.
 * Mocking will fail without it, since NodeJS doesn't have a declaration for the type.  */
class MockMutationObserver {
  constructor(callback) {}
  observe() {}
  disconnect() {}
  takeRecords() {}
}

/**
 * @description
 * - Sets {@link globalThis.MutationObserver} to {@link MockMutationObserver}, because NodeJS doesn't declare the type.
 * - Creates a Mock WebLayerManager and WebContainer3D.
 * - Adds an {@link XRUIComponent} to the {@param entity} with the mocked {@link WebContainer3D}.
 * - Sets the bounds of the {@link XRUIComponent.rootLayer} to the `@param size`.
 * - Sets the `visible` property for each children of the {@link XRUIComponent.rootLayer} to `true`.
 * @param entity The entity that the {@link XRUIComponent} will be added to.
 * @param size The size of the {@link XRUIComponent.rootLayer.bounds}.
 */
export function createMockXRUI(entity: Entity, size: number = 1) {
  // @ts-ignore
  globalThis.MutationObserver = MockMutationObserver

  const containerElement = document.createElement('div')
  containerElement.style.position = 'fixed'
  containerElement.id = 'xrui-' + 'mock' // UIFunc.name
  const manager = new WebLayerManager('mock-WebLayerManager')

  const bounds = new Bounds()
  bounds.height = size
  bounds.width = size

  const container = new WebContainer3D(containerElement, { manager: manager })
  const xrui = setComponent(entity, XRUIComponent, container)
  xrui.rootLayer.bounds = bounds
  xrui.rootLayer.margin = new Edges()
  xrui.rootLayer.children.forEach((child) => {
    child.visible = true
  })
}
