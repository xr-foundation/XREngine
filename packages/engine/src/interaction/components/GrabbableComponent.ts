
import { useEffect } from 'react'

import { getComponent, hasComponent, useEntityContext } from '@xrengine/ecs'
import { defineComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { getState, isClient } from '@xrengine/hyperflux'
import { setCallback } from '@xrengine/spatial/src/common/CallbackComponent'
import { InputSourceComponent } from '@xrengine/spatial/src/input/components/InputSourceComponent'
import { InputState } from '@xrengine/spatial/src/input/state/InputState'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { dropEntity, grabEntity } from '../functions/grabbableFunctions'
import { InteractableComponent, XRUIVisibilityOverride } from './InteractableComponent'

const grabbableCallbackName = 'grabCallback'

export const XRHandedness = S.LiteralUnion(['none', 'left', 'right'], 'none')

/**
 * GrabbableComponent
 * - Allows an entity to be grabbed by a GrabberComponent
 */
export const GrabbableComponent = defineComponent({
  name: 'GrabbableComponent',
  jsonID: 'XRENGINE_grabbable', // TODO: rename to grabbable

  toJSON: () => true,

  grabbableCallbackName,

  reactor: function () {
    const entity = useEntityContext()
    useEffect(() => {
      if (isClient) {
        setCallback(entity, grabbableCallbackName, () => grabCallback(entity))
      }
    }, [])
    return null
  }
})

const grabCallback = (targetEntity: Entity) => {
  const nonCapturedInputSources = InputSourceComponent.nonCapturedInputSources()
  for (const entity of nonCapturedInputSources) {
    const inputSource = getComponent(entity, InputSourceComponent)
    onGrab(targetEntity, inputSource.source.handedness === 'left' ? 'left' : 'right')
  }
}
const updateUI = (entity: Entity) => {
  const isGrabbed = hasComponent(entity, GrabbedComponent)
  const interactable = getComponent(entity, InteractableComponent)
  interactable.uiVisibilityOverride = isGrabbed ? XRUIVisibilityOverride.off : XRUIVisibilityOverride.none
}

const onGrab = (targetEntity: Entity, handedness = getState(InputState).preferredHand) => {
  const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
  if (!hasComponent(targetEntity, GrabbableComponent)) return
  const grabber = getComponent(selfAvatarEntity, GrabberComponent)
  const grabbedEntity = grabber[handedness]!
  if (!grabbedEntity) return
  if (grabbedEntity) {
    onDrop()
  } else {
    grabEntity(selfAvatarEntity, targetEntity, handedness)
  }
  updateUI(targetEntity)
}
export const onDrop = () => {
  const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
  const grabber = getComponent(selfAvatarEntity, GrabberComponent)
  const handedness = getState(InputState).preferredHand
  const grabbedEntity = grabber[handedness]!
  if (!grabbedEntity) return
  dropEntity(selfAvatarEntity)
  updateUI(grabbedEntity)
}

/**
 * GrabbedComponent
 * - Indicates that an entity is currently being grabbed by a GrabberComponent
 */
export const GrabbedComponent = defineComponent({
  name: 'GrabbedComponent',

  schema: S.Object({
    attachmentPoint: XRHandedness,
    grabberEntity: S.Entity()
  })
})

/**
 * GrabberComponent
 * - Allows an entity to grab a GrabbableComponent
 */
export const GrabberComponent = defineComponent({
  name: 'GrabberComponent',

  schema: S.Object({
    left: S.Nullable(S.Entity()),
    right: S.Nullable(S.Entity())
  })
})
