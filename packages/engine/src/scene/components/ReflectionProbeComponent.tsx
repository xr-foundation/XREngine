
import { defineComponent, useComponent, useEntityContext } from '@xrengine/ecs'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { useEffect } from 'react'
import { Texture } from 'three'
import { useTexture } from '../../assets/functions/resourceLoaderHooks'
import { addError } from '../functions/ErrorFunctions'

export const ReflectionProbeComponent = defineComponent({
  name: 'ReflectionProbeComponent',
  jsonID: 'IR_reflectionProbe',

  schema: S.Object({
    src: S.String(''),
    texture: S.Nullable(S.Type<Texture>())
  }),

  toJSON: (component) => ({
    src: component.src
  }),

  errors: ['LOADING_ERROR'],
  reactor: () => {
    const entity = useEntityContext()
    const probeComponent = useComponent(entity, ReflectionProbeComponent)

    const [probeTexture, error] = useTexture(probeComponent.src.value, entity)

    useEffect(() => {
      if (!probeTexture) return
      probeComponent.texture.set(probeTexture)
    }, [probeTexture])

    useEffect(() => {
      if (!error) return
      probeComponent.texture.set(null)
      addError(entity, ReflectionProbeComponent, 'LOADING_ERROR', 'Failed to load reflection probe texture.')
    })
  }
})
