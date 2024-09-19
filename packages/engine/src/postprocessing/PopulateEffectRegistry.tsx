
import { PresentationSystemGroup } from '@xrengine/ecs'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { useEffect } from 'react'
import { bloomAddToEffectRegistry } from './BloomEffect'
import { brightnessContrastAddToEffectRegistry } from './BrightnessContrastEffect'
import { chromaticAberrationAddToEffectRegistry } from './ChromaticAberrationEffect'
import { colorAverageAddToEffectRegistry } from './ColorAverageEffect'
import { colorDepthAddToEffectRegistry } from './ColorDepthEffect'
import { depthOfFieldAddToEffectRegistry } from './DepthOfFieldEffect'
import { dotScreenAddToEffectRegistry } from './DotScreenEffect'
import { fxaaAddToEffectRegistry } from './FXAAEffect'
import { glitchAddToEffectRegistry } from './GlitchEffect'
import { gridAddToEffectRegistry } from './GridEffect'
import { hueSaturationAddToEffectRegistry } from './HueSaturationEffect'
import { lut1DAddToEffectRegistry } from './LUT1DEffect'
import { lut3DAddToEffectRegistry } from './LUT3DEffect'
import { lensDistortionAddToEffectRegistry } from './LensDistortionEffect'
import { linearTosRGBAddToEffectRegistry } from './LinearTosRGBEffect'
import { motionBlurAddToEffectRegistry } from './MotionBlurEffect'
import { noiseAddToEffectRegistry } from './NoiseEffect'
import { pixelationAddToEffectRegistry } from './PixelationEffect'
import { smaaAddToEffectRegistry } from './SMAAEffect'
import { ssaoAddToEffectRegistry } from './SSAOEffect'
import { ssgiAddToEffectRegistry } from './SSGIEffect'
import { ssrAddToEffectRegistry } from './SSREffect'
import { scanlineAddToEffectRegistry } from './ScanlineEffect'
import { shockWaveAddToEffectRegistry } from './ShockWaveEffect'
import { traaAddToEffectRegistry } from './TRAAEffect'
import { textureAddToEffectRegistry } from './TextureEffect'
import { tiltShiftAddToEffectRegistry } from './TiltShiftEffect'
import { toneMappingAddToEffectRegistry } from './ToneMappingEffect'
import { vignetteAddToEffectRegistry } from './VignetteEffect'

export const populateEffectRegistry = () => {
  // registers the effects
  bloomAddToEffectRegistry()
  brightnessContrastAddToEffectRegistry()
  chromaticAberrationAddToEffectRegistry()
  colorAverageAddToEffectRegistry()
  colorDepthAddToEffectRegistry()
  depthOfFieldAddToEffectRegistry()
  dotScreenAddToEffectRegistry()
  fxaaAddToEffectRegistry()
  glitchAddToEffectRegistry()
  //GodRaysEffect
  gridAddToEffectRegistry()
  hueSaturationAddToEffectRegistry()
  lensDistortionAddToEffectRegistry()
  linearTosRGBAddToEffectRegistry()
  lut1DAddToEffectRegistry()
  lut3DAddToEffectRegistry()
  motionBlurAddToEffectRegistry()
  noiseAddToEffectRegistry()
  pixelationAddToEffectRegistry()
  scanlineAddToEffectRegistry()
  shockWaveAddToEffectRegistry()
  smaaAddToEffectRegistry()
  ssaoAddToEffectRegistry()
  ssrAddToEffectRegistry()
  ssgiAddToEffectRegistry()
  textureAddToEffectRegistry()
  tiltShiftAddToEffectRegistry()
  toneMappingAddToEffectRegistry()
  traaAddToEffectRegistry()
  vignetteAddToEffectRegistry()
}

export const PostProcessingRegisterSystem = defineSystem({
  uuid: 'xrengine.engine.PostProcessingRegisterSystem',
  insert: { before: PresentationSystemGroup },
  reactor: () => {
    useEffect(() => populateEffectRegistry(), [])
    return null
  }
})
