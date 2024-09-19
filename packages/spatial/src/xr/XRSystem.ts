
import { useEffect } from 'react'

import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { InputSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { defineActionQueue, getMutableState } from '@xrengine/hyperflux'

import { xrSessionChanged } from './XRSessionFunctions'
import { XRAction, XRState } from './XRState'

/**
 * System for XR session and input handling
 */

const updateSessionSupportForMode = (mode: XRSessionMode) => {
  navigator.xr
    ?.isSessionSupported(mode)
    .then((supported) => getMutableState(XRState).supportedSessionModes[mode].set(supported))
}

const updateSessionSupport = () => {
  updateSessionSupportForMode('inline')
  updateSessionSupportForMode('immersive-ar')
  updateSessionSupportForMode('immersive-vr')
}

const xrSessionChangedQueue = defineActionQueue(XRAction.sessionChanged.matches)

const execute = () => {
  for (const action of xrSessionChangedQueue()) xrSessionChanged(action)
}

const reactor = () => {
  useEffect(() => {
    navigator.xr?.addEventListener('devicechange', updateSessionSupport)
    updateSessionSupport()

    return () => {
      navigator.xr?.removeEventListener('devicechange', updateSessionSupport)
    }
  }, [])
  return null
}

export const XRSystem = defineSystem({
  uuid: 'xrengine.engine.XRSystem',
  insert: { before: InputSystemGroup },
  execute,
  reactor
})
