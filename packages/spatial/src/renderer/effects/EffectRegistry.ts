
import { Entity } from '@xrengine/ecs'
import { State, defineState } from '@xrengine/hyperflux'
import { EffectComposer } from 'postprocessing'
import React from 'react'
import { Scene } from 'three'

export type EffectReactorProps = {
  isActive: State<boolean, any>
  rendererEntity: Entity
  effectData: any
  effects: any
  composer: EffectComposer
  scene: Scene
}

/** Interface for dynamic effect Registry
 * @param reactor reactor for effect
 * @param defaultValues specifies the default values for the effect adhering to schema
 * @param schema specifies a schema for the editor to generate UI for each effect. (@todo Eventually can generate from default values)
 * @example
 * {
    reactor: ChromaticAberrationEffectProcessReactor,
    defaultValues: {
      hue: 1,
      saturation: 1
    },
    schema: {
      hue: { propertyType: PropertyTypes.Number, name: 'Hue', min: -1, max: 1, step: 0.01 },
      saturation: { propertyType: PropertyTypes.Number, name: 'Saturation', min: -1, max: 1, step: 0.01 }
    }
   }
 */
export interface EffectRegistryEntry {
  reactor: React.FC<EffectReactorProps>
  defaultValues: any
  schema: any
}

export const PostProcessingEffectState = defineState({
  name: 'PostProcessingEffectState',
  initial: {} as Record<string, EffectRegistryEntry>
})
