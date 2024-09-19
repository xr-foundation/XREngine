import React from 'react'

import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
// import { VrIcon } from '../../../common/components/Icons/VrIcon'
import { respawnAvatar } from '@xrengine/engine/src/avatar/functions/respawnAvatar'
import { createState, dispatchAction, getMutableState, useHookstate, useMutableState } from '@xrengine/hyperflux'
import { InputState } from '@xrengine/spatial/src/input/state/InputState'
import { XRState } from '@xrengine/spatial/src/xr/XRState'
import { createXRUI } from '@xrengine/spatial/src/xrui/functions/createXRUI'
import { RegisteredWidgets, WidgetAppActions, WidgetAppState } from '@xrengine/spatial/src/xrui/WidgetAppService'
import Icon from '@xrengine/ui/src/primitives/mui/Icon'

import { useMediaInstance } from '../../../common/services/MediaInstanceConnectionService'
import { MediaStreamState } from '../../../media/MediaStreamState'
import XRIconButton from '../../components/XRIconButton'
import HandSVG from './back_hand_24px.svg?react'
import styleString from './index.scss?inline'

export function createWidgetButtonsView() {
  return createXRUI(WidgetButtons, createWidgetButtonsState())
}

function createWidgetButtonsState() {
  return createState({})
}

type WidgetButtonProps = {
  icon: any
  toggle: () => any
  label: string
  disabled?: boolean
}

const WidgetButton = ({ icon, toggle, label, disabled }: WidgetButtonProps) => {
  const mouseOver = useHookstate(false)
  return (
    <XRIconButton
      disabled={disabled}
      size="large"
      content={
        <>
          {<Icon type={icon} className="svgIcon" />}
          {mouseOver.value && <div>{label}</div>}
        </>
      }
      onClick={toggle}
      onMouseEnter={() => mouseOver.set(true)}
      onMouseLeave={() => mouseOver.set(false)}
      xr-layer="true"
    />
  )
}

const HandednessWidgetButton = () => {
  const preferredHand = useHookstate(getMutableState(InputState).preferredHand)
  const mouseOver = useHookstate(false)
  return (
    <XRIconButton
      disabled={false}
      size="large"
      content={
        mouseOver.value ? (
          <div>{preferredHand.value === 'left' ? 'Left' : 'Right'}</div>
        ) : (
          <>
            <div style={{ transform: `scaleX(${preferredHand.value === 'right' ? -1 : 1})` }}>
              <HandSVG />
            </div>
            <div
              style={{
                color: 'var(--iconButtonBackground)',
                position: 'absolute',
                fontSize: '10px'
              }}
            >
              {preferredHand.value === 'left' ? 'L' : 'R'}
            </div>
          </>
        )
      }
      onClick={() => preferredHand.set((val) => (val === 'left' ? 'right' : 'left'))}
      onMouseEnter={() => mouseOver.set(true)}
      onMouseLeave={() => mouseOver.set(false)}
      xr-layer="true"
    />
  )
}

const WidgetButtons = () => {
  const widgetMutableState = useMutableState(WidgetAppState)
  const sessionMode = useHookstate(getMutableState(XRState).sessionMode)
  const mediaInstanceState = useMediaInstance()

  const mediaStreamState = useMutableState(MediaStreamState)
  const isCamAudioEnabled = !!mediaStreamState.microphoneMediaStream.value && mediaStreamState.microphoneEnabled.value

  // TODO: add a notification hint function to the widget wrapper and move unread messages there
  // useEffect(() => {
  //   activeChannel &&
  //     activeChannel.messages &&
  //     activeChannel.messages.length > 0 &&
  //     !widgetMutableState.chatMenuOpen.value &&
  //     setUnreadMessages(true)
  // }, [activeChannel?.messages])

  // const toggleVRSession = () => {
  //   if (engineState.xrSessionStarted.value) {
  //     endXRSession()
  //   } else {
  //     requestXRSession()
  //   }
  // }

  const handleRespawnAvatar = () => {
    respawnAvatar(AvatarComponent.getSelfAvatarEntity())
  }

  const handleHeightAdjustment = () => {
    XRState.setTrackingSpace()
  }

  const widgets = Object.entries(widgetMutableState.widgets.value).map(([id, widgetMutableState]) => ({
    id,
    ...widgetMutableState,
    ...RegisteredWidgets.get(id)!
  }))

  const toggleWidget = (toggledWidget) => () => {
    const state = widgetMutableState.widgets.value
    const visible = state[toggledWidget.id].visible
    // close currently open widgets until we support multiple widgets being open at once
    if (!visible) {
      Object.entries(state).forEach(([id, widget]) => {
        if (widget.visible && id !== toggledWidget.id) dispatchAction(WidgetAppActions.showWidget({ id, shown: false }))
      })
    }
    dispatchAction(WidgetAppActions.showWidget({ id: toggledWidget.id, shown: !visible }))
  }

  const activeWidgets = widgets.filter((widget) => widget.enabled && widget.icon)

  const additionalWidgetCount = 1 + (mediaInstanceState?.value ? 1 : 0)
  const gridTemplateColumns = new Array(additionalWidgetCount)
    .fill('1fr')
    .concat(activeWidgets.map(() => ' 1fr'))
    .join(' ')

  return (
    <>
      <style>{styleString}</style>
      <div className="container" style={{ gridTemplateColumns }} xr-pixel-ratio="8" xr-layer="true">
        <WidgetButton icon="Refresh" toggle={handleRespawnAvatar} label={'Respawn'} />
        {sessionMode.value !== 'none' && (
          <WidgetButton icon="Person" toggle={handleHeightAdjustment} label={'Reset Height'} />
        )}
        <HandednessWidgetButton />
        {mediaInstanceState?.value && (
          <WidgetButton
            icon={isCamAudioEnabled ? 'Mic' : 'MicOff'}
            toggle={MediaStreamState.toggleMicrophonePaused}
            label={isCamAudioEnabled ? 'Audio on' : 'Audio Off'}
          />
        )}
        {/* <WidgetButton
          Icon={VrIcon}
          toggle={toggleVRSession}
          label={engineState.xrSessionStarted.value ? 'Exit VR' : 'Enter VR'}
        /> */}
        {activeWidgets.map((widget, i) => (
          <WidgetButton key={i} icon={widget.icon} toggle={toggleWidget(widget)} label={widget.label} />
        ))}
      </div>
    </>
  )
}
