import { Material, Uniform, Vector3 } from 'three'

import {
  defineComponent,
  defineQuery,
  getComponent,
  getOptionalComponent,
  PresentationSystemGroup,
  useEntityContext
} from '@xrengine/ecs'
import { ECSState } from '@xrengine/ecs/src/ECSState'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { getState } from '@xrengine/hyperflux'
import { generateNoiseTexture } from '@xrengine/spatial/src/renderer/functions/generateNoiseTexture'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { useEffect } from 'react'
import { MaterialStateComponent } from '../../MaterialComponent'
import { setPlugin } from '../../materialFunctions'

export type NoiseOffsetParameters = {
  textureSize: Uniform
  frequency: Uniform
  noiseTexture: Uniform
  time: Uniform
  offsetAxis: Uniform
}

export const NoiseOffsetPluginComponent = defineComponent({
  name: 'NoiseOffsetPluginComponent',

  schema: S.Object({
    textureSize: S.Class(() => new Uniform(64)),
    frequency: S.Class(() => new Uniform(0.00025)),
    amplitude: S.Class(() => new Uniform(0.005)),
    noiseTexture: S.Class(() => new Uniform(generateNoiseTexture(64))),
    offsetAxis: S.Class(() => new Uniform(new Vector3(0, 1, 0))),
    time: S.Class(() => new Uniform(0))
  }),

  reactor: () => {
    const entity = useEntityContext()
    useEffect(() => {
      const materialComponent = getOptionalComponent(entity, MaterialStateComponent)
      if (!materialComponent) return
      const callback = (shader) => {
        const plugin = getComponent(entity, NoiseOffsetPluginComponent)

        shader.uniforms.textureSize = plugin.textureSize
        shader.uniforms.frequency = plugin.frequency
        shader.uniforms.amplitude = plugin.amplitude
        plugin.noiseTexture.value = generateNoiseTexture(64)
        shader.uniforms.noiseTexture = plugin.noiseTexture
        shader.uniforms.offsetAxis = plugin.offsetAxis
        shader.uniforms.time = plugin.time

        shader.vertexShader = shader.vertexShader.replace(
          'void main() {',
          `
            uniform sampler2D noiseTexture;
            uniform float textureSize; // The width of a slice
            uniform float frequency;
            uniform float amplitude;
            uniform float time;

            vec3 sampleNoise(vec3 pos) {
                float zSlice = (pos.z * textureSize);
                vec2 slicePos = vec2(zSlice / textureSize, fract(zSlice / textureSize));
                vec2 noisePos = slicePos + pos.xy / textureSize;
                return vec3(texture2D(noiseTexture, noisePos).r);
            }

            vec3 turbulence(vec3 position) {
              vec3 sum = vec3(0.0);
              float frequencyMutliplied = frequency;
              float amplitudeMultiplied = amplitude;

              for (int i = 0; i < 4; i++) {
                  vec3 p = position * frequencyMutliplied;
                  p.z += time * 0.0015;

                  sum += sampleNoise(p).rgb * amplitudeMultiplied;

                  frequencyMutliplied *= 2.0;
                  amplitudeMultiplied *= 7.0;
              }

              return sum;
            }

            void main() {
          `
        )
        shader.vertexShader = shader.vertexShader.replace(
          'void main() {',
          `uniform vec3 offsetAxis;
        void main() {`
        )
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `
            #include <begin_vertex>
            vec4 noiseWorldPosition = vec4(transformed, 1.0);
            noiseWorldPosition = modelMatrix * noiseWorldPosition;
            #ifdef USE_INSTANCING
              noiseWorldPosition = instanceMatrix * noiseWorldPosition;
            #endif
            vec3 offset = turbulence(noiseWorldPosition.xyz) * offsetAxis;
            transformed += offset;
          `
        )
      }
      setPlugin(materialComponent.material as Material, callback)
    }, [])
    return null
  }
})

const noisePluginQuery = defineQuery([NoiseOffsetPluginComponent])
const execute = () => {
  for (const entity of noisePluginQuery()) {
    const noisePlugin = getOptionalComponent(entity, NoiseOffsetPluginComponent)
    if (!noisePlugin) continue
    const elapsedSeconds = getState(ECSState).elapsedSeconds
    noisePlugin.time.value = elapsedSeconds
  }
}

export const NoiseOffsetSystem = defineSystem({
  uuid: 'xrengine.spatial.material.NoiseOffsetSystem',
  insert: { before: PresentationSystemGroup },
  execute
})
