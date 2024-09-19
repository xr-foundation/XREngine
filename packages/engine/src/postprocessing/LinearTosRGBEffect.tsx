import { Entity } from '@xrengine/ecs'
import { getMutableState, getState, none } from '@xrengine/hyperflux'
import { EffectReactorProps, PostProcessingEffectState } from '@xrengine/spatial/src/renderer/effects/EffectRegistry'
import { LinearTosRGBEffect } from '@xrengine/spatial/src/renderer/effects/LinearTosRGBEffect'
import React, { useEffect } from 'react'

declare module 'postprocessing' {
  interface EffectComposer {
    LinearTosRGBEffect: LinearTosRGBEffect
  }
}

const effectKey = 'LinearTosRGBEffect'

export const LinearTosRGBEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
  isActive
  rendererEntity: Entity
  effectData
  effects
}) => {
  const { isActive, rendererEntity, effectData, effects } = props
  const effectState = getState(PostProcessingEffectState)

  useEffect(() => {
    if (effectData[effectKey].value) return
    effectData[effectKey].set(effectState[effectKey].defaultValues)
  }, [])

  useEffect(() => {
    if (!isActive?.value) {
      if (effects[effectKey].value) effects[effectKey].set(none)
      return
    }
    const eff = new LinearTosRGBEffect(effectData[effectKey].value)
    effects[effectKey].set(eff)
    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive])

  return null
}

export const linearTosRGBAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: LinearTosRGBEffectProcessReactor,
      defaultValues: {
        isActive: false,
        skew: 0
      },
      schema: {}
    }
  })
}
