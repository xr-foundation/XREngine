import React, { useEffect } from 'react'
import { Joystick } from 'react-joystick-component'

import { InteractableState } from '@xrengine/engine/src/interaction/functions/interactableFunctions'
import { useHookstate, useMutableState } from '@xrengine/hyperflux'
import { isTouchAvailable } from '@xrengine/spatial/src/common/functions/DetectFeatures'
import { AnyButton, XRStandardGamepadButton } from '@xrengine/spatial/src/input/state/ButtonState'
import { XRState, isMobileXRHeadset } from '@xrengine/spatial/src/xr/XRState'
import Icon from '@xrengine/ui/src/primitives/mui/Icon'

import { AppState } from '../../services/AppService'
import styles from './index.module.scss'

const triggerButton = (button: AnyButton, pressed: boolean): void => {
  const eventType = pressed ? 'touchgamepadbuttondown' : 'touchgamepadbuttonup'
  const event = new CustomEvent(eventType)
  document.dispatchEvent(event)
}

const handleMove = (e) => {
  const event = new CustomEvent('touchstickmove', {
    detail: {
      stick: 'LeftStick',
      value: { x: e.x, y: -e.y, angleRad: 0 }
    }
  })

  document.dispatchEvent(event)
}

const handleStop = () => {
  const event = new CustomEvent('touchstickmove', {
    detail: { stick: 'LeftStick', value: { x: 0, y: 0, angleRad: 0 } }
  })
  document.dispatchEvent(event)
}

const buttonsConfig: Array<{ button: AnyButton; label: React.ReactElement }> = [
  {
    button: XRStandardGamepadButton.XRStandardGamepadTrigger,
    label: <Icon type="TouchApp" />
  }
]

export const TouchGamepad = () => {
  const interactableState = useMutableState(InteractableState)
  const availableInteractable = interactableState.available.value?.[0]
  const appState = useMutableState(AppState)

  const isMovementControlsEnabled = XRState.useMovementControlsEnabled()

  const hasGamepad = useHookstate(false)

  useEffect(() => {
    const getGamepads = () => {
      hasGamepad.set(!!navigator.getGamepads().filter(Boolean).length)
    }
    getGamepads()
    window.addEventListener('gamepadconnected', getGamepads)
    window.addEventListener('gamepaddisconnected', getGamepads)
    return () => {
      window.removeEventListener('gamepadconnected', getGamepads)
      window.removeEventListener('gamepaddisconnected', getGamepads)
    }
  }, [])

  if (
    !isMovementControlsEnabled ||
    !isTouchAvailable ||
    isMobileXRHeadset ||
    !appState.showTouchPad.value ||
    hasGamepad.value
  )
    return <></>

  const buttons = buttonsConfig.map((value, index) => {
    return (
      <div
        key={index}
        className={styles.controllButton + ' ' + styles[`gamepadButton_${value.label}`] + ' ' + styles.availableButton}
        onPointerDown={(): void => triggerButton(value.button, true)}
        onPointerUp={(): void => triggerButton(value.button, false)}
      >
        {value.label}
      </div>
    )
  })

  return (
    <>
      <div className={styles.stickLeft}>
        <Joystick
          size={100}
          throttle={100}
          minDistance={40}
          move={handleMove}
          stop={handleStop}
          baseColor="rgba(255, 255, 255, 0.5)"
          stickColor="rgba(255, 255, 255, 0.8)"
        />
      </div>
      {availableInteractable && <div className={styles.controlButtonContainer}>{buttons}</div>}
    </>
  )
}
