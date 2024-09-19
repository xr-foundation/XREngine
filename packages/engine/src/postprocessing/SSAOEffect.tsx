import { Entity, useComponent } from '@xrengine/ecs'
import { getMutableState, getState, none } from '@xrengine/hyperflux'
import { CameraComponent } from '@xrengine/spatial/src/camera/components/CameraComponent'
import { EffectReactorProps, PostProcessingEffectState } from '@xrengine/spatial/src/renderer/effects/EffectRegistry'
import { BlendFunction, Resolution, SSAOEffect } from 'postprocessing'
import React, { useEffect } from 'react'
import { ArrayCamera } from 'three'
import { PropertyTypes } from './PostProcessingRegister'

declare module 'postprocessing' {
  interface EffectComposer {
    SSAOEffect: SSAOEffect
  }
}

const effectKey = 'SSAOEffect'

export const SSAOEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
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
    const camera = useComponent(rendererEntity, CameraComponent)
    const eff = new SSAOEffect(camera.value as ArrayCamera, effectData[effectKey].value)
    effects[effectKey].set(eff)
    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive])

  return null
}

export const ssaoAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: SSAOEffectProcessReactor,
      defaultValues: {
        isActive: false,
        blendFunction: BlendFunction.MULTIPLY,
        distanceScaling: true,
        depthAwareUpsampling: true,
        normalDepthBuffer: undefined,
        samples: 9,
        rings: 7,
        // worldDistanceThreshold: 0.97,
        // worldDistanceFalloff: 0.03,
        // worldProximityThreshold: 0.0005,
        // worldProximityFalloff: 0.001,
        distanceThreshold: 0.97, // Render up to a distance of ~20 world units
        distanceFalloff: 0.03, // with an additional ~2.5 units of falloff.
        rangeThreshold: 0.0005,
        rangeFalloff: 0.001,
        minRadiusScale: 0.1,
        luminanceInfluence: 0.7,
        bias: 0.025,
        radius: 0.1825,
        intensity: 1.0,
        fade: 0.01,
        color: undefined,
        resolutionScale: 1.0,
        resolutionX: Resolution.AUTO_SIZE,
        resolutionY: Resolution.AUTO_SIZE,
        width: Resolution.AUTO_SIZE,
        height: Resolution.AUTO_SIZE
      },
      schema: {
        preset: { propertyType: PropertyTypes.SMAAPreset, name: 'Preset' }
      }
    }
  })
}
