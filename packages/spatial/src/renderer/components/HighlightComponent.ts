
import { defineQuery, defineSystem, Engine } from '@xrengine/ecs'
import { defineComponent, getComponent, hasComponent } from '@xrengine/ecs/src/ComponentFunctions'

import { Object3D } from 'three'
import { traverseEntityNode } from '../../transform/components/EntityTree'
import { RendererComponent, WebGLRendererSystem } from '../WebGLRendererSystem'
import { GroupComponent } from './GroupComponent'
import { MeshComponent } from './MeshComponent'
import { VisibleComponent } from './VisibleComponent'

export const HighlightComponent = defineComponent({ name: 'HighlightComponent' })

const highlightQuery = defineQuery([HighlightComponent, VisibleComponent])

const execute = () => {
  /** @todo support multiple scenes */
  if (!hasComponent(Engine.instance.viewerEntity, RendererComponent)) return

  const highlightObjects = new Set<Object3D>()
  for (const entity of highlightQuery()) {
    traverseEntityNode(entity, (child, index) => {
      if (!hasComponent(child, MeshComponent)) return
      if (!hasComponent(child, GroupComponent)) return
      if (!hasComponent(child, VisibleComponent)) return
      highlightObjects.add(getComponent(child, MeshComponent))
    })
  }
  const rendererComponent = getComponent(Engine.instance.viewerEntity, RendererComponent)
  rendererComponent.effectComposer?.OutlineEffect?.selection.set(highlightObjects)
}

export const HighlightSystem = defineSystem({
  uuid: 'HighlightSystem',
  insert: { before: WebGLRendererSystem },
  execute
})
