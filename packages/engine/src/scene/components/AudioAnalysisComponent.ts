import { useEffect } from 'react'

import { defineComponent, setComponent, useComponent, useEntityContext, useOptionalComponent } from '@xrengine/ecs'
import { TransformComponent } from '@xrengine/spatial'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { PositionalAudioComponent } from '../../audio/components/PositionalAudioComponent'
import { AudioNodeGroups, MediaComponent, MediaElementComponent } from './MediaComponent'

export type AudioAnalysisSession = {
  analyser: AnalyserNode
  frequencyData: Uint8Array
}

export const AudioAnalysisComponent = defineComponent({
  name: 'XRENGINE_audio_analyzer',
  jsonID: 'audio-analyzer',

  schema: S.Object({
    src: S.String(''),
    session: S.Nullable(S.Type<AudioAnalysisSession>(), null),
    bassEnabled: S.Bool(true),
    midEnabled: S.Bool(true),
    trebleEnabled: S.Bool(true),
    bassMultiplier: S.Number(1),
    midMultiplier: S.Number(1),
    trebleMultiplier: S.Number(1)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const audioAnaylsisComponent = useComponent(entity, AudioAnalysisComponent)
    const posAudio = useOptionalComponent(entity, PositionalAudioComponent)
    const mediaElement = useOptionalComponent(entity, MediaElementComponent)
    const existingSystem = useComponent(entity, MediaComponent)

    useEffect(() => {
      setComponent(entity, VisibleComponent)
      setComponent(entity, NameComponent, 'AudioAnalysis')
      setComponent(entity, TransformComponent)
    }, [])

    useEffect(() => {
      audioAnaylsisComponent.src.set(existingSystem?.path.values[0])
    }, [existingSystem.path])

    useEffect(() => {
      if (!posAudio || !mediaElement?.value.element) return

      const element = mediaElement.value.element as HTMLAudioElement
      element.onplay = () => {
        const audioObject = AudioNodeGroups.get(element)

        if (audioObject) {
          const audioContext = audioObject.source.context
          const analyser = audioContext.createAnalyser()
          analyser.fftSize = 2 ** 5
          audioObject.source.connect(analyser)
          audioAnaylsisComponent.session.set({
            analyser,
            frequencyData: new Uint8Array(analyser.frequencyBinCount)
          })
        }
      }
    }, [audioAnaylsisComponent, posAudio, mediaElement])

    return null
  }
})
