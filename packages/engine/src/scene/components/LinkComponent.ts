import { useEffect } from 'react'
import { Vector3 } from 'three'

import { defineComponent, getComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { defineState, getMutableState, getState, isClient } from '@xrengine/hyperflux'
import { setCallback } from '@xrengine/spatial/src/common/CallbackComponent'
import { XRState } from '@xrengine/spatial/src/xr/XRState'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { InputComponent } from '@xrengine/spatial/src/input/components/InputComponent'
import { addError, clearErrors } from '../functions/ErrorFunctions'

const linkLogic = (linkEntity: Entity, xrState) => {
  const linkComponent = getComponent(linkEntity, LinkComponent)
  if (!linkComponent.sceneNav) {
    xrState && xrState.session?.end()
    typeof window === 'object' && window && window.open(linkComponent.url, '_blank')
  } else {
    getMutableState(LinkState).location.set(linkComponent.location)
  }
}
const linkCallback = (linkEntity: Entity) => {
  const buttons = InputComponent.getMergedButtons(linkEntity)
  if (buttons.XRStandardGamepadTrigger?.down) {
    const xrState = getState(XRState)
    linkLogic(linkEntity, xrState)
  } else {
    linkLogic(linkEntity, undefined)
  }
}

const vec3 = new Vector3()
const interactMessage = 'Click to follow'
const linkCallbackName = 'linkCallback'

export const LinkState = defineState({
  name: 'LinkState',
  initial: {
    location: undefined as undefined | string
  }
})

export const LinkComponent = defineComponent({
  name: 'LinkComponent',
  jsonID: 'XRENGINE_link',

  schema: S.Object({
    url: S.String(''),
    sceneNav: S.Bool(false),
    location: S.String('')
  }),

  linkCallbackName,
  linkCallback,
  interactMessage,

  errors: ['INVALID_URL'],

  reactor: function () {
    if (!isClient) return null
    const entity = useEntityContext()
    const link = useComponent(entity, LinkComponent)

    useEffect(() => {
      clearErrors(entity, LinkComponent)
      if (link.sceneNav.value) return
      try {
        new URL(link.url.value)
      } catch {
        return addError(entity, LinkComponent, 'INVALID_URL', 'Please enter a valid URL.')
      }
      return
    }, [link.url, link.sceneNav])

    useEffect(() => {
      setCallback(entity, linkCallbackName, () => LinkComponent.linkCallback(entity))
    }, [])

    return null
  }
})
