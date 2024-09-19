
import { Vector3 } from 'three'

import { isClient } from '@xrengine/common/src/utils/getEnvironment'
import { Engine, getMutableComponent, InputSystemGroup, UndefinedEntity } from '@xrengine/ecs'
import { getComponent, getOptionalComponent, setComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { ECSState } from '@xrengine/ecs/src/ECSState'
import { Entity } from '@xrengine/ecs/src/Entity'
import { defineQuery } from '@xrengine/ecs/src/QueryFunctions'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { MediaComponent } from '@xrengine/engine/src/scene/components/MediaComponent'
import { getState } from '@xrengine/hyperflux'
import { createTransitionState } from '@xrengine/spatial/src/common/functions/createTransitionState'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { EngineState } from '@xrengine/spatial/src/EngineState'
import { InputComponent } from '@xrengine/spatial/src/input/components/InputComponent'
import { InputSourceComponent } from '@xrengine/spatial/src/input/components/InputSourceComponent'
import { InputState } from '@xrengine/spatial/src/input/state/InputState'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'
import { XRUIComponent } from '@xrengine/spatial/src/xrui/components/XRUIComponent'
import { WebLayer3D } from '@xrengine/xrui'

import { createMediaControlsView } from './ui/MediaControlsUI'

const controlsUiPosVec3 = new Vector3()
let clicking = false
const MediaFadeTransitions = new Map<Entity, ReturnType<typeof createTransitionState>>()
const mediaQuery = defineQuery([MediaComponent])

export const createMediaControlsUI = (entity: Entity) => {
  const ui = createMediaControlsView(entity)

  setComponent(ui.entity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
  setComponent(ui.entity, NameComponent, 'mediacontrols-ui-' + entity)

  ui.container.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
    const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
    mat.transparent = true
  })

  return ui
}

const onUpdate = (entity: Entity) => {
  const mediaComponent = getMutableComponent(entity, MediaComponent)
  if (!mediaComponent.controls.value) return
  const xrui = getComponent(mediaComponent.xruiEntity.value, XRUIComponent)
  const transition = MediaFadeTransitions.get(entity)!
  const buttonLayer = xrui.rootLayer.querySelector('#button')

  const inputComponent = getComponent(entity, InputComponent)
  const inputSourceEntity = inputComponent?.inputSources[0]

  //inputsource and entity 0 = hover
  //inputsource and entity 3 = clicking HERE
  //noinput and entity 3 = clicking somewhere else or still clicking
  //noinputsource and entity 0 = no hover, no click
  const capturingEntity = getState(InputState).capturingEntity

  if (inputSourceEntity) {
    const inputSource = getOptionalComponent(inputSourceEntity, InputSourceComponent)

    if (capturingEntity !== UndefinedEntity) {
      const buttons = inputSource?.buttons
      clicking = !!buttons //clicking on our boundingbox this frame

      mediaComponent.paused.set(!mediaComponent.paused.value)
    }
  }

  const hover = inputSourceEntity && capturingEntity === UndefinedEntity
  const showUI = hover || clicking

  //fires one frame late to prevent mouse up frame issue
  if (clicking && !inputSourceEntity && capturingEntity === UndefinedEntity) {
    clicking = false
  }
  if (showUI) {
    transition.setState('IN')
  } else {
    transition.setState('OUT')
  }
  const uiTransform = getComponent(mediaComponent.xruiEntity.value, TransformComponent)
  const transform = getComponent(entity, TransformComponent)

  //logic for positioning the controls on the border of the video no matter the resolution/scale
  // if (buttonLayer) {
  //   let buttonOffset = buttonLayer.domSize.y * xrui.rootLayer.domSize.y * 1.2 //HACK 1.2 is a magic number here to include the button border (10px on a 100px button)
  //   controlsUiPosVec3.set(transform.scale.x * 0.5 - buttonOffset, -transform.scale.y * 0.5 - buttonOffset, 0)
  // }

  controlsUiPosVec3.copy(mediaComponent.uiOffset.value) //used to add - might be nice to allow for some pre-placed anchor positions
  controlsUiPosVec3.add(transform.position)
  uiTransform.position.copy(controlsUiPosVec3)

  const deltaSeconds = getState(ECSState).deltaSeconds
  transition.update(deltaSeconds, (opacity) => {
    buttonLayer?.scale.setScalar(0.9 + 0.1 * opacity * opacity)
    xrui.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
      const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
      mat.opacity = opacity
    })
  })
}

const execute = () => {
  if (getState(EngineState).isEditor || !isClient) return

  for (const entity of mediaQuery.enter()) {
    const mediaComponent = getComponent(entity, MediaComponent)
    if (!mediaComponent.controls) continue

    const transition = createTransitionState(0.25, 'IN')
    MediaFadeTransitions.set(entity, transition)
    mediaComponent.xruiEntity = createMediaControlsUI(entity).entity
    setComponent(mediaComponent.xruiEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
  }

  for (const entity of mediaQuery.exit()) {
    if (MediaFadeTransitions.has(entity)) MediaFadeTransitions.delete(entity)
  }

  for (const entity of mediaQuery()) {
    onUpdate(entity)
  }
}

export const MediaControlSystem = defineSystem({
  uuid: 'xrengine.engine.MediaControlSystem',
  insert: { after: InputSystemGroup },
  execute
})
