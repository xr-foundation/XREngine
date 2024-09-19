
import { getComponent, setComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'
import { XRUIComponent } from '@xrengine/spatial/src/xrui/components/XRUIComponent'
import { WebLayer3D } from '@xrengine/xrui'

import { createModalView } from '../ui/InteractiveModalView'

/**
 * Creates and returns an xrUI on the specified entity
 * (this replaces createInteractUI and createNonInteractUI (by adding a bool isInteractable optional param)
 * @param entity  entity to add the xrUI to
 * @param uiMessage  text to display on the UI
 * @param isInteractable  (optional, default = true) sets whether the UI is interactable or not
 */
export function createUI(entity: Entity, uiMessage: string, isInteractable = true) {
  const ui = createModalView(entity, uiMessage, isInteractable)

  const nameComponent = getComponent(entity, NameComponent)
  setComponent(ui.entity, NameComponent, 'interact-ui-' + uiMessage + '-' + nameComponent)

  const xrui = getComponent(ui.entity, XRUIComponent)
  xrui.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
    const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
    mat.transparent = true
  })
  const transform = getComponent(ui.entity, TransformComponent)
  transform.scale.setScalar(1)

  return ui
}
