
import { Entity, useComponent } from '@xrengine/ecs'
import { getMutableState, getState, none, useHookstate } from '@xrengine/hyperflux'
import { CameraComponent } from '@xrengine/spatial/src/camera/components/CameraComponent'
import { EffectReactorProps, PostProcessingEffectState } from '@xrengine/spatial/src/renderer/effects/EffectRegistry'
import React, { useEffect } from 'react'
import { MotionBlurEffect, VelocityDepthNormalPass } from 'realism-effects'
import { Scene } from 'three'
import { PropertyTypes } from './PostProcessingRegister'

declare module 'postprocessing' {
  interface EffectComposer {
    MotionBlurEffect: MotionBlurEffect
  }
}

const effectKey = 'MotionBlurEffect'

export const MotionBlurEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
  isActive
  rendererEntity: Entity
  effectData
  effects
}) => {
  const { isActive, rendererEntity, effectData, effects } = props
  const effectState = getState(PostProcessingEffectState)
  const camera = useComponent(rendererEntity, CameraComponent)
  const scene = useHookstate<Scene>(() => new Scene())
  const velocityDepthNormalPass = useHookstate(new VelocityDepthNormalPass(scene, camera))
  const useVelocityDepthNormalPass = useHookstate(false)

  useEffect(() => {
    if (effectData[effectKey].value) return
    effectData[effectKey].set(effectState[effectKey].defaultValues)
  }, [])

  useEffect(() => {
    if (!isActive?.value) {
      if (effects[effectKey].value) effects[effectKey].set(none)
      return
    }
    const eff = new MotionBlurEffect(velocityDepthNormalPass, effectData[effectKey].value)
    effects[effectKey].set(eff)
    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive])

  return null
}

export const motionBlurAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: MotionBlurEffectProcessReactor,
      defaultValues: {
        isActive: false,
        intensity: 1,
        jitter: 1,
        samples: 16
      },
      schema: {
        intensity: { propertyType: PropertyTypes.Number, name: 'Intensity', min: 0, max: 10, step: 0.01 },
        jitter: { propertyType: PropertyTypes.Number, name: 'Jitter', min: 0, max: 10, step: 0.01 },
        samples: { propertyType: PropertyTypes.Number, name: 'Samples', min: 1, max: 64, step: 1 }
      }
    }
  })
}
