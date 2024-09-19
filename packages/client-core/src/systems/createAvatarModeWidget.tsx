
import { useEffect } from 'react'

import { getComponent, removeComponent, setComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { dispatchAction, getMutableState, getState, startReactor, useHookstate } from '@xrengine/hyperflux'
import { VisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import { XRState } from '@xrengine/spatial/src/xr/XRState'
import { createXRUI } from '@xrengine/spatial/src/xrui/functions/createXRUI'
import { WidgetAppActions } from '@xrengine/spatial/src/xrui/WidgetAppService'
import { Widget, Widgets } from '@xrengine/spatial/src/xrui/Widgets'

import { Engine, EntityUUID, UUIDComponent } from '@xrengine/ecs'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import { translateAndRotateAvatar, updateLocalAvatarPosition } from '@xrengine/engine/src/avatar/functions/moveAvatar'
import { respawnAvatar } from '@xrengine/engine/src/avatar/functions/respawnAvatar'
import { EntityNetworkState } from '@xrengine/network'
import { TransformComponent } from '@xrengine/spatial'
import { EngineState } from '@xrengine/spatial/src/EngineState'
import { RigidBodyComponent } from '@xrengine/spatial/src/physics/components/RigidBodyComponent'
import { EntityTreeComponent, iterateEntityNode } from '@xrengine/spatial/src/transform/components/EntityTree'
import { computeTransformMatrix } from '@xrengine/spatial/src/transform/systems/TransformSystem'
import { Quaternion, Vector3 } from 'three'

export function createAvatarModeWidget() {
  const ui = createXRUI(() => null)
  removeComponent(ui.entity, VisibleComponent)

  const widget: Widget = {
    ui,
    label: 'Avatar Mode',
    icon: 'Person',
    onOpen: () => {
      const avatarEntity = AvatarComponent.getSelfAvatarEntity()
      const currentParent = getComponent(avatarEntity, EntityTreeComponent).parentEntity
      if (currentParent === getState(EngineState).localFloorEntity) {
        getMutableState(XRState).avatarCameraMode.set('auto')
        const uuid = Engine.instance.userID as any as EntityUUID
        const parentUUID = getState(EntityNetworkState)[uuid].parentUUID
        const parentEntity = UUIDComponent.getEntityByUUID(parentUUID)
        setComponent(avatarEntity, EntityTreeComponent, { parentEntity })
        respawnAvatar(avatarEntity)
        iterateEntityNode(avatarEntity, computeTransformMatrix)
      } else {
        getMutableState(XRState).avatarCameraMode.set('attached')
        setComponent(avatarEntity, EntityTreeComponent, { parentEntity: getState(EngineState).localFloorEntity })
        getComponent(avatarEntity, RigidBodyComponent).targetKinematicPosition.set(0, 0, 0) // todo instead fo 0,0,0 make it camera relative to floor entity on the floor (y = 0)
        updateLocalAvatarPosition(avatarEntity)
        translateAndRotateAvatar(avatarEntity, new Vector3(), new Quaternion())
        console.log(
          getComponent(getState(EngineState).localFloorEntity, TransformComponent).position.x,
          getComponent(getState(EngineState).localFloorEntity, TransformComponent).position.y,
          getComponent(getState(EngineState).localFloorEntity, TransformComponent).position.z
        )
        iterateEntityNode(avatarEntity, computeTransformMatrix)
      }
      dispatchAction(WidgetAppActions.showWidgetMenu({ shown: false }))
    }
  }

  /** for testing */
  // globalThis.toggle = widget.onOpen

  const id = Widgets.registerWidget(ui.entity, widget)

  const reactor = startReactor(() => {
    const xrState = useHookstate(getMutableState(XRState))
    const isCameraAttachedToAvatar = XRState.useCameraAttachedToAvatar()
    const widgetEnabled =
      xrState.sessionMode.value === 'immersive-ar' &&
      xrState.scenePlacementMode.value === 'placed' &&
      !isCameraAttachedToAvatar

    useEffect(() => {
      dispatchAction(WidgetAppActions.enableWidget({ id, enabled: widgetEnabled }))
    }, [widgetEnabled])

    return null
  })
}
