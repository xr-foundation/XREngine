import { FrontSide, Material, Uniform, Vector3 } from 'three'

import { defineComponent, getComponent, getOptionalComponent, useEntityContext } from '@xrengine/ecs'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { MaterialStateComponent } from '@xrengine/spatial/src/renderer/materials/MaterialComponent'
import { setPlugin } from '@xrengine/spatial/src/renderer/materials/materialFunctions'
import { useEffect } from 'react'
import {
  ditheringAlphatestChunk,
  ditheringFragUniform,
  ditheringVertex,
  ditheringVertexUniform
} from './ditherShaderChunk'

export enum ditherCalculationType {
  worldTransformed = 1,
  localPosition = 0
}

export const MAX_DITHER_POINTS = 2 //should be equal to the length of the vec3 array in the shader

export const TransparencyDitheringRootComponent = defineComponent({
  name: 'TransparencyDitheringRootComponent',
  schema: S.Object({ materials: S.Array(S.EntityUUID()) })
})

export const TransparencyDitheringPluginComponent = defineComponent({
  name: 'TransparencyDitheringPluginComponent',
  schema: S.NonSerialized(
    S.Object({
      centers: S.Class(() => new Uniform(Array.from({ length: MAX_DITHER_POINTS }, () => new Vector3()))),
      exponents: S.Class(() => new Uniform(Array.from({ length: MAX_DITHER_POINTS }, () => 1))),
      distances: S.Class(() => new Uniform(Array.from({ length: MAX_DITHER_POINTS }, () => 1))),
      useWorldCalculation: S.Class(
        () => new Uniform(Array.from({ length: MAX_DITHER_POINTS }, () => ditherCalculationType.worldTransformed))
      )
    })
  ),

  reactor: () => {
    const entity = useEntityContext()
    useEffect(() => {
      const materialComponent = getOptionalComponent(entity, MaterialStateComponent)
      if (!materialComponent) return
      const material = materialComponent.material as Material
      const callback = (shader) => {
        material.alphaTest = 0.5
        material.side = FrontSide
        const plugin = getComponent(entity, TransparencyDitheringPluginComponent)

        if (!shader.vertexShader.startsWith('varying vec3 vWorldPosition')) {
          shader.vertexShader = shader.vertexShader.replace(
            /#include <common>/,
            '#include <common>\n' + ditheringVertexUniform
          )
        }
        shader.vertexShader = shader.vertexShader.replace(
          /#include <worldpos_vertex>/,
          '	#include <worldpos_vertex>\n' + ditheringVertex
        )
        if (!shader.fragmentShader.startsWith('varying vec3 vWorldPosition'))
          shader.fragmentShader = shader.fragmentShader.replace(
            /#include <common>/,
            '#include <common>\n' + ditheringFragUniform
          )
        shader.fragmentShader = shader.fragmentShader.replace(/#include <alphatest_fragment>/, ditheringAlphatestChunk)
        shader.uniforms.centers = plugin.centers
        shader.uniforms.exponents = plugin.exponents
        shader.uniforms.distances = plugin.distances
        shader.uniforms.useWorldCalculation = plugin.useWorldCalculation
      }
      setPlugin(materialComponent.material as Material, callback)
    })
    return null
  }
})
