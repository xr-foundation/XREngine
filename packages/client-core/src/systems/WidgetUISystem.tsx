
import { useEffect } from 'react'
import { Quaternion, Vector3 } from 'three'

import { isDev } from '@xrengine/common/src/config'
import { getComponent, hasComponent, removeComponent, setComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Engine } from '@xrengine/ecs/src/Engine'
import { removeEntity } from '@xrengine/ecs/src/EntityFunctions'
import { defineQuery } from '@xrengine/ecs/src/QueryFunctions'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import {
  defineActionQueue,
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  useMutableState
} from '@xrengine/hyperflux'
// import { createHeightAdjustmentWidget } from './createHeightAdjustmentWidget'
// import { createMediaWidget } from './createMediaWidget'
import { CameraComponent } from '@xrengine/spatial/src/camera/components/CameraComponent'
import { Vector3_Back, Vector3_Up } from '@xrengine/spatial/src/common/constants/MathConstants'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { InputSourceComponent } from '@xrengine/spatial/src/input/components/InputSourceComponent'
import { XRStandardGamepadButton } from '@xrengine/spatial/src/input/state/ButtonState'
import { setVisibleComponent, VisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import { ComputedTransformComponent } from '@xrengine/spatial/src/transform/components/ComputedTransformComponent'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'
import { TransformSystem } from '@xrengine/spatial/src/transform/systems/TransformSystem'
import { isMobileXRHeadset, ReferenceSpace, XRState } from '@xrengine/spatial/src/xr/XRState'
import { ObjectFitFunctions } from '@xrengine/spatial/src/xrui/functions/ObjectFitFunctions'
import {
  RegisteredWidgets,
  WidgetAppActions,
  WidgetAppService,
  WidgetAppState
} from '@xrengine/spatial/src/xrui/WidgetAppService'

import { EngineState } from '@xrengine/spatial/src/EngineState'
import React from 'react'
import { createAnchorWidget } from './createAnchorWidget'
import { createWidgetButtonsView } from './ui/WidgetMenuView'

const widgetLeftMenuGripOffset = new Vector3(0.08, 0, -0.05)
const widgetRightMenuGripOffset = new Vector3(-0.08, 0, -0.05)
const vec3 = new Vector3()

const widgetLeftRotation = new Quaternion()
  .setFromAxisAngle(Vector3_Up, Math.PI * 0.5)
  .multiply(new Quaternion().setFromAxisAngle(Vector3_Back, -Math.PI * 0.5))

const widgetRightRotation = new Quaternion()
  .setFromAxisAngle(Vector3_Up, -Math.PI * 0.5)
  .multiply(new Quaternion().setFromAxisAngle(Vector3_Back, Math.PI * 0.5))

const WidgetUISystemState = defineState({
  name: 'WidgetUISystemState',
  initial: {
    widgetMenuUI: null as ReturnType<typeof createWidgetButtonsView> | null
  }
})

const createWidgetMenus = () => {
  createAnchorWidget()
  // createAvatarModeWidget()
  // createRecordingsWidget()
  // createHeightAdjustmentWidget
  // createMediaWidget
}

const toggleWidgetsMenu = (handedness: 'left' | 'right' = getState(WidgetAppState).handedness) => {
  const widgetState = getState(WidgetAppState)
  const state = widgetState.widgets
  const openWidget = Object.entries(state).find(([id, widget]) => widget.visible)
  if (openWidget) {
    dispatchAction(WidgetAppActions.showWidget({ id: openWidget[0], shown: false }))
    dispatchAction(WidgetAppActions.showWidgetMenu({ shown: true, handedness }))
  } else {
    if (widgetState.handedness !== handedness) {
      dispatchAction(WidgetAppActions.showWidgetMenu({ shown: true, handedness }))
    } else {
      dispatchAction(WidgetAppActions.showWidgetMenu({ shown: !widgetState.widgetsMenuOpen, handedness }))
    }
  }
}

const inputSourceQuery = defineQuery([InputSourceComponent])

const showWidgetQueue = defineActionQueue(WidgetAppActions.showWidget.matches)
const registerWidgetQueue = defineActionQueue(WidgetAppActions.registerWidget.matches)
const unregisterWidgetQueue = defineActionQueue(WidgetAppActions.unregisterWidget.matches)

const execute = () => {
  const { widgetMenuUI } = getState(WidgetUISystemState)
  if (!widgetMenuUI) return

  const widgetState = getState(WidgetAppState)
  const inputSources = inputSourceQuery()

  for (const inputSourceEntity of inputSources) {
    const inputSource = getComponent(inputSourceEntity, InputSourceComponent)
    const keys = inputSource.buttons
    if (inputSource.source.gamepad?.mapping === 'xr-standard') {
      if (keys[XRStandardGamepadButton.XRStandardGamepadButtonA]?.down)
        toggleWidgetsMenu(inputSource.source.handedness === 'left' ? 'right' : 'left')
    }
    /** @todo allow non HMDs to access the widget menu too */
    if ((isDev || isMobileXRHeadset) && keys.Escape?.down) toggleWidgetsMenu()
  }

  for (const action of showWidgetQueue()) {
    const widget = RegisteredWidgets.get(action.id)!
    setVisibleComponent(widget.ui.entity, action.shown)
    if (action.shown) {
      if (typeof widget.onOpen === 'function') widget.onOpen()
    } else if (typeof widget.onClose === 'function') widget.onClose()
  }
  for (const action of registerWidgetQueue()) {
    const widget = RegisteredWidgets.get(action.id)!
    setComponent(widget.ui.entity, EntityTreeComponent, { parentEntity: widgetMenuUI.entity })
  }
  for (const action of unregisterWidgetQueue()) {
    const widget = RegisteredWidgets.get(action.id)!
    setComponent(widget.ui.entity, EntityTreeComponent, { parentEntity: Engine.instance.localFloorEntity })
    if (typeof widget.cleanup === 'function') widget.cleanup()
  }

  const activeInputSourceEntity = inputSources.find(
    (entity) => getComponent(entity, InputSourceComponent).source.handedness === widgetState.handedness
  )

  if (activeInputSourceEntity) {
    const activeInputSource = getComponent(activeInputSourceEntity, InputSourceComponent)?.source
    const pose = getState(XRState).xrFrame?.getPose(
      activeInputSource.gripSpace ?? activeInputSource.targetRaySpace,
      ReferenceSpace.localFloor!
    )
    if (hasComponent(widgetMenuUI.entity, ComputedTransformComponent)) {
      removeComponent(widgetMenuUI.entity, ComputedTransformComponent)
      setComponent(widgetMenuUI.entity, EntityTreeComponent, { parentEntity: Engine.instance.localFloorEntity })
      setComponent(widgetMenuUI.entity, TransformComponent, { scale: new Vector3().setScalar(1) })
    }

    const transform = getComponent(widgetMenuUI.entity, TransformComponent)
    if (pose) {
      const rot = widgetState.handedness === 'left' ? widgetLeftRotation : widgetRightRotation
      const offset = widgetState.handedness === 'left' ? widgetLeftMenuGripOffset : widgetRightMenuGripOffset
      const orientation = pose.transform.orientation as any as Quaternion
      transform.rotation.copy(orientation).multiply(rot)
      vec3.copy(offset).applyQuaternion(orientation)
      transform.position.copy(pose.transform.position as any as Vector3).add(vec3)
    }
  } else {
    if (!hasComponent(widgetMenuUI.entity, ComputedTransformComponent)) {
      setComponent(widgetMenuUI.entity, EntityTreeComponent, { parentEntity: Engine.instance.localFloorEntity })
      setComponent(widgetMenuUI.entity, ComputedTransformComponent, {
        referenceEntities: [Engine.instance.viewerEntity],
        computeFunction: () => {
          const camera = getComponent(Engine.instance.viewerEntity, CameraComponent)
          const distance = camera.near * 1.1 // 10% in front of camera
          ObjectFitFunctions.attachObjectInFrontOfCamera(widgetMenuUI.entity, 0.2, distance)
        }
      })
    }
  }

  const widgetMenuShown = widgetState.widgetsMenuOpen
  setVisibleComponent(widgetMenuUI.entity, widgetMenuShown)

  for (const [id, widget] of RegisteredWidgets) {
    if (!widgetState.widgets[id]) continue
    const widgetEnabled = widgetState.widgets[id].enabled
    if (widgetEnabled && typeof widget.system === 'function') {
      widget.system()
    }
  }
}

const Reactor = () => {
  const xrState = useMutableState(XRState)

  useEffect(() => {
    if (!xrState.sessionActive.value) {
      WidgetAppService.closeWidgets()
      const widgetState = getState(WidgetAppState)
      dispatchAction(WidgetAppActions.showWidgetMenu({ shown: false, handedness: widgetState.handedness }))
    }
  }, [xrState.sessionActive])

  useEffect(() => {
    const widgetMenuUI = createWidgetButtonsView()
    setComponent(widgetMenuUI.entity, EntityTreeComponent, { parentEntity: Engine.instance.localFloorEntity })
    setComponent(widgetMenuUI.entity, TransformComponent)
    removeComponent(widgetMenuUI.entity, VisibleComponent)
    setComponent(widgetMenuUI.entity, NameComponent, 'widget_menu')
    // const helper = new AxesHelper(0.1)
    // setObjectLayers(helper, ObjectLayers.Gizmos)
    // addObjectToGroup(widgetMenuUI.entity, helper)

    getMutableState(WidgetUISystemState).widgetMenuUI.set(widgetMenuUI)

    createWidgetMenus()
    return () => {
      removeEntity(widgetMenuUI.entity)
    }
  }, [])

  return null
}

export const WidgetUISystem = defineSystem({
  uuid: 'xrengine.client.WidgetUISystem',
  insert: { before: TransformSystem },
  execute,
  reactor: () => {
    if (!useMutableState(EngineState).viewerEntity.value) return null
    return <Reactor />
  }
})
