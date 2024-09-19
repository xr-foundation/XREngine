
import { Entity, defineComponent, useComponent, useEntityContext } from '@xrengine/ecs'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { ErrorBoundary, getState, useMutableState } from '@xrengine/hyperflux'
import { EffectComposer } from 'postprocessing'
import React, { Suspense } from 'react'
import { Scene } from 'three'
import { EffectSchema, RendererComponent } from '../WebGLRendererSystem'
import { PostProcessingEffectState } from '../effects/EffectRegistry'
import { useRendererEntity } from '../functions/useRendererEntity'

export const PostProcessingComponent = defineComponent({
  name: 'PostProcessingComponent',
  jsonID: 'XRENGINE_postprocessing',

  schema: S.Object({
    enabled: S.Bool(false),
    effects: S.Record(S.String(), EffectSchema)
  }),

  /** @todo this will be replaced with spatial queries or distance checks */
  reactor: () => {
    const entity = useEntityContext()
    const rendererEntity = useRendererEntity(entity)

    if (!rendererEntity) return null

    return <PostProcessingReactor entity={entity} rendererEntity={rendererEntity} />
  }
})

const PostProcessingReactor = (props: { entity: Entity; rendererEntity: Entity }) => {
  const { entity, rendererEntity } = props
  const postProcessingComponent = useComponent(entity, PostProcessingComponent)
  const EffectRegistry = useMutableState(PostProcessingEffectState).keys
  const renderer = useComponent(rendererEntity, RendererComponent)
  const effects = renderer.effects
  const composer = renderer.effectComposer.value as EffectComposer
  const scene = renderer.scene.value as Scene

  if (!postProcessingComponent.enabled.value) return null

  // for each effect specified in our postProcessingComponent, we mount a sub-reactor based on the effect registry for that effect ID
  return (
    <>
      {EffectRegistry.map((key) => {
        const effect = getState(PostProcessingEffectState)[key] // get effect registry entry
        if (!effect) return null
        return (
          <Suspense key={key}>
            <ErrorBoundary>
              <effect.reactor
                isActive={postProcessingComponent.effects[key]?.isActive}
                rendererEntity={rendererEntity}
                effectData={postProcessingComponent.effects}
                effects={effects}
                composer={composer}
                scene={scene}
              />
            </ErrorBoundary>
          </Suspense>
        )
      })}
    </>
  )
}
