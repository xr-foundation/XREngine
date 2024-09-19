
import { useEffect } from 'react'

import { defineComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { MediaSettingsState } from '@xrengine/engine/src/audio/MediaSettingsState'
import { getMutableState, getState } from '@xrengine/hyperflux'

const DistanceModelTypeSchema = S.LiteralUnion(['exponential', 'inverse', 'linear'], 'linear')

export const MediaSettingsComponent = defineComponent({
  name: 'MediaSettingsComponent',
  jsonID: 'XRENGINE_media_settings',

  schema: S.Object({
    immersiveMedia: S.Bool(false),
    refDistance: S.Number(20),
    rolloffFactor: S.Number(1),
    maxDistance: S.Number(10000),
    distanceModel: DistanceModelTypeSchema,
    coneInnerAngle: S.Number(360),
    coneOuterAngle: S.Number(0),
    coneOuterGain: S.Number(0)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, MediaSettingsComponent)

    for (const prop of Object.keys(getState(MediaSettingsState))) {
      useEffect(() => {
        if (component[prop].value !== getState(MediaSettingsState)[prop])
          getMutableState(MediaSettingsState)[prop].set(component[prop].value)
      }, [component[prop]])
    }

    return null
  }
})
