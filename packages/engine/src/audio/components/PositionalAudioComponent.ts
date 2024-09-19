import { useEffect } from 'react'

import {
  defineComponent,
  getOptionalComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@xrengine/ecs'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { AudioNodeGroups, MediaElementComponent } from '@xrengine/engine/src/scene/components/MediaComponent'
import { getMutableState, useHookstate } from '@xrengine/hyperflux'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { RendererState } from '@xrengine/spatial/src/renderer/RendererState'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { PositionalAudioHelperComponent } from './PositionalAudioHelperComponent'

export interface PositionalAudioInterface {
  refDistance: number
  rolloffFactor: number
  maxDistance: number
  distanceModel: DistanceModelType
  coneInnerAngle: number
  coneOuterAngle: number
  coneOuterGain: number
}

const distanceModel = S.LiteralUnion(['exponential', 'inverse', 'linear'], 'inverse')

export const PositionalAudioComponent = defineComponent({
  name: 'XRENGINE_positionalAudio',

  jsonID: 'XRENGINE_audio',

  schema: S.Object({
    distanceModel,
    rolloffFactor: S.Number(3),
    refDistance: S.Number(1),
    maxDistance: S.Number(40),
    coneInnerAngle: S.Number(360),
    coneOuterAngle: S.Number(0),
    coneOuterGain: S.Number(0)
  }),

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)
    const audio = useComponent(entity, PositionalAudioComponent)
    const mediaElement = useOptionalComponent(entity, MediaElementComponent)

    useEffect(() => {
      if (debugEnabled.value) {
        if (!mediaElement || !mediaElement.element.value) return
        const audioNodes = AudioNodeGroups.get(mediaElement.element.value as HTMLMediaElement)
        if (!audioNodes) return
        const name = getOptionalComponent(entity, NameComponent)
        setComponent(entity, PositionalAudioHelperComponent, {
          audio: audioNodes,
          name: name ? `${name}-positional-audio-helper` : undefined
        })
      }

      return () => {
        removeComponent(entity, PositionalAudioHelperComponent)
      }
    }, [debugEnabled, mediaElement?.element])

    useEffect(() => {
      if (!mediaElement?.element.value) return
      const audioNodes = AudioNodeGroups.get(mediaElement.element.value as HTMLMediaElement)
      if (!audioNodes?.panner) return
      audioNodes.panner.refDistance = audio.refDistance.value
      audioNodes.panner.rolloffFactor = audio.rolloffFactor.value
      audioNodes.panner.maxDistance = audio.maxDistance.value
      audioNodes.panner.distanceModel = audio.distanceModel.value
      audioNodes.panner.coneInnerAngle = audio.coneInnerAngle.value
      audioNodes.panner.coneOuterAngle = audio.coneOuterAngle.value
      audioNodes.panner.coneOuterGain = audio.coneOuterGain.value
    }, [
      audio.refDistance,
      audio.rolloffFactor,
      audio.maxDistance,
      audio.distanceModel,
      audio.coneInnerAngle,
      audio.coneOuterAngle,
      audio.coneOuterGain
    ])

    return null
  }
})
