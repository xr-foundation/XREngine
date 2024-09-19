import Pause from '@mui/icons-material/Pause'
import PlayArrow from '@mui/icons-material/PlayArrow'
import React from 'react'

import { getMutableComponent, getOptionalComponent, hasComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { MediaComponent, MediaElementComponent } from '@xrengine/engine/src/scene/components/MediaComponent'
import { VideoComponent } from '@xrengine/engine/src/scene/components/VideoComponent'
import { useHookstate } from '@xrengine/hyperflux'
import { TransformComponent } from '@xrengine/spatial'
import { XRUIComponent } from '@xrengine/spatial/src/xrui/components/XRUIComponent'
import { createXRUI } from '@xrengine/spatial/src/xrui/functions/createXRUI'

export function createMediaControlsView(entity: Entity) {
  const MediaControls = () => <MediaControlsView entity={entity} />
  const videoTransform = getOptionalComponent(entity, TransformComponent)
  const videoComponent = getOptionalComponent(entity, VideoComponent)
  const scaleX = (videoComponent?.size.x ?? 1) * (videoTransform?.scale.x ?? 1)
  const scaleY = (videoComponent?.size.y ?? 1) * (videoTransform?.scale.y ?? 1)

  const controlsUIScale = Math.min(scaleX, scaleY)

  const xrUI = createXRUI(MediaControls, null, { interactable: false })
  const xrUITransform = getOptionalComponent(xrUI.entity, XRUIComponent)
  xrUITransform?.scale.set(controlsUIScale, controlsUIScale, 1)

  return xrUI
}

type MediaControlsProps = {
  entity: Entity
}

const MediaControlsView = (props: MediaControlsProps) => {
  const mediaComponent = useHookstate(getMutableComponent(props.entity, MediaComponent))
  const mediaStyles = { fill: 'white', width: `100%`, height: `100%` }
  const buttonClick = () => {
    //early out if the mediaElement is null
    if (!hasComponent(props.entity, MediaElementComponent)) return

    const isPaused = mediaComponent.paused.value
    mediaComponent.paused.set(!isPaused)
  }

  /** @todo does not currently support tailwind css */
  return (
    <div
      xr-layer="true"
      id="container"
      style={{
        width: `1000px`,
        height: `1000px`,
        display: 'flex',
        alignItems: 'center',
        justifyItems: 'center',
        justifyContent: 'center',
        flex: 'auto'
      }}
    >
      <button
        xr-layer="true"
        id="button"
        style={{
          fontFamily: "'Roboto', sans-serif",
          border: '10px solid grey',
          boxShadow: '#fff2 0 0 30px',
          color: 'lightgrey',
          fontSize: '25px',
          width: '10%',
          height: '10%',
          transform: 'translateZ(0.01px)'
        }}
        onClick={buttonClick}
      >
        <style>
          {`
        button {
          background-color: #000000dd;
        }
        button:hover {
            background-color: grey;
        }`}
        </style>

        {mediaComponent.paused.value && <PlayArrow style={mediaStyles} />}
        {!mediaComponent.paused.value && <Pause style={mediaStyles} />}
      </button>
    </div>
  )
}
