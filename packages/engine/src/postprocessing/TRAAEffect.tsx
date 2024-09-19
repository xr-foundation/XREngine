
import { Entity, useComponent } from '@xrengine/ecs'
import { getMutableState, getState, none, useHookstate } from '@xrengine/hyperflux'
import { CameraComponent } from '@xrengine/spatial/src/camera/components/CameraComponent'
import { EffectReactorProps, PostProcessingEffectState } from '@xrengine/spatial/src/renderer/effects/EffectRegistry'
import React, { useEffect } from 'react'
import { TRAAEffect, VelocityDepthNormalPass } from 'realism-effects'
import { Scene } from 'three'
import { PropertyTypes } from './PostProcessingRegister'

declare module 'postprocessing' {
  interface EffectComposer {
    TRAAEffect: TRAAEffect
  }
}

const effectKey = 'TRAAEffect'

export const TRAAEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
  isActive
  rendererEntity: Entity
  effectData
  effects
  scene: Scene
}) => {
  const { isActive, rendererEntity, effectData, effects, scene } = props
  const effectState = getState(PostProcessingEffectState)
  const camera = useComponent(rendererEntity, CameraComponent)
  const velocityDepthNormalPass = useHookstate(new VelocityDepthNormalPass(scene, camera))

  useEffect(() => {
    if (effectData[effectKey].value) return
    effectData[effectKey].set(effectState[effectKey].defaultValues)
  }, [])

  useEffect(() => {
    if (!isActive?.value) {
      if (effects[effectKey].value) effects[effectKey].set(none)
      return
    }

    // todo support more than 1 texture
    const textureCount = 1

    const eff = new TRAAEffect(scene, camera.value, velocityDepthNormalPass, textureCount, effectData[effectKey].value)
    effects[effectKey].set(eff)

    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive, effectData[effectKey], scene, velocityDepthNormalPass])

  return null
}

export const traaAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: TRAAEffectProcessReactor,
      defaultValues: {
        isActive: false,
        blend: 0.8,
        constantBlend: true,
        dilation: true,
        blockySampling: false,
        logTransform: false, // ! TODO: check if can use logTransform withoutt artifacts
        depthDistance: 10,
        worldDistance: 5,
        neighborhoodClamping: true
      },
      schema: {
        blend: { propertyType: PropertyTypes.Number, name: 'Blend', min: 0, max: 1, step: 0.001 },
        constantBlend: { propertyType: PropertyTypes.Boolean, name: 'Constant Blend' },
        dilation: { propertyType: PropertyTypes.Boolean, name: 'Dilation' },
        blockySampling: { propertyType: PropertyTypes.Boolean, name: 'Blocky Sampling' },
        logTransform: { propertyType: PropertyTypes.Boolean, name: 'Log Transform' },
        depthDistance: { propertyType: PropertyTypes.Number, name: 'Depth Distance', min: 0.01, max: 100, step: 0.01 },
        worldDistance: { propertyType: PropertyTypes.Number, name: 'World Distance', min: 0.01, max: 100, step: 0.01 },
        neighborhoodClamping: { propertyType: PropertyTypes.Boolean, name: 'Neighborhood Clamping' }
      }
    }
  })
}
