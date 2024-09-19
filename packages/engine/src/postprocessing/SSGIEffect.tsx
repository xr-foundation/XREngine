import { Entity } from '@xrengine/ecs'
import { getMutableState, getState, none } from '@xrengine/hyperflux'
import { EffectReactorProps, PostProcessingEffectState } from '@xrengine/spatial/src/renderer/effects/EffectRegistry'
import React, { useEffect } from 'react'
import { SSGIEffect } from 'realism-effects'
import { PropertyTypes } from './PostProcessingRegister'

declare module 'postprocessing' {
  interface EffectComposer {
    SSGIEffect: SSGIEffect
  }
}

const effectKey = 'SSGIEffect'

export const SSGIEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
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

    const eff = new SSGIEffect(effectData[effectKey].value)
    effects[effectKey].set(eff)
    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive])

  return null
}

export const ssgiAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: SSGIEffectProcessReactor,
      defaultValues: {
        isActive: false,
        distance: 10,
        thickness: 10,
        denoiseIterations: 1,
        denoiseKernel: 2,
        denoiseDiffuse: 10,
        denoiseSpecular: 10,
        radius: 3,
        phi: 0.5,
        lumaPhi: 5,
        depthPhi: 2,
        normalPhi: 50,
        roughnessPhi: 50,
        specularPhi: 50,
        envBlur: 0.5,
        importanceSampling: true,
        steps: 20,
        refineSteps: 5,
        resolutionScale: 1,
        missedRays: false
      },
      schema: {
        distance: { propertyType: PropertyTypes.Number, name: 'Distance', min: 0.001, max: 10, step: 0.01 },
        thickness: { propertyType: PropertyTypes.Number, name: 'Thickness', min: 0, max: 5, step: 0.01 },
        denoiseIterations: { propertyType: PropertyTypes.Number, name: 'Denoise Iterations', min: 0, max: 5, step: 1 },
        denoiseKernel: { propertyType: PropertyTypes.Number, name: 'Denoise Kernel', min: 1, max: 5, step: 1 },
        denoiseDiffuse: { propertyType: PropertyTypes.Number, name: 'Denoise Diffuse', min: 0, max: 50, step: 0.01 },
        denoiseSpecular: { propertyType: PropertyTypes.Number, name: 'Denoise Specular', min: 0, max: 50, step: 0.01 },
        radius: { propertyType: PropertyTypes.Number, name: 'Radius', min: 0, max: 50, step: 0.01 },
        phi: { propertyType: PropertyTypes.Number, name: 'Phi', min: 0, max: 50, step: 0.01 },
        lumaPhi: { propertyType: PropertyTypes.Number, name: 'Denoise Specular', min: 0, max: 50, step: 0.01 },
        depthPhi: { propertyType: PropertyTypes.Number, name: 'luminosity Phi', min: 0, max: 15, step: 0.001 },
        normalPhi: { propertyType: PropertyTypes.Number, name: 'Normal Phi', min: 0, max: 50, step: 0.001 },
        roughnessPhi: { propertyType: PropertyTypes.Number, name: 'Roughness Phi', min: 0, max: 100, step: 0.001 },
        specularPhi: { propertyType: PropertyTypes.Number, name: 'Specular Phi', min: 0, max: 50, step: 0.01 },
        envBlur: { propertyType: PropertyTypes.Number, name: 'Environment Blur', min: 0, max: 1, step: 0.01 },
        importanceSampling: { propertyType: PropertyTypes.Boolean, name: 'Importance Sampling' },
        steps: { propertyType: PropertyTypes.Number, name: 'Steps', min: 0, max: 256, step: 1 },
        refineSteps: { propertyType: PropertyTypes.Number, name: 'Refine Steps', min: 0, max: 16, step: 1 },
        resolutionScale: {
          propertyType: PropertyTypes.Number,
          name: 'Resolution Scale',
          min: 0.25,
          max: 1,
          step: 0.25
        },
        missedRays: { propertyType: PropertyTypes.Boolean, name: 'Missed Rays' }
      }
    }
  })
}
