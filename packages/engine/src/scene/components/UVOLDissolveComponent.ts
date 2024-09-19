import {
  BufferGeometry,
  Mesh,
  MeshBasicMaterial,
  ShaderLib,
  ShaderMaterial,
  Texture,
  UniformsLib,
  UniformsUtils
} from 'three'

import { defineComponent, getComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'

export const UVOLDissolveComponent = defineComponent({
  name: 'UVOLDissolveComponent',

  schema: S.Object({
    currentTime: S.Number(0),
    duration: S.Number(2)
  }),

  /**
   * If material is a shader material,
   * This expects the texture to be at material.uniforms.map.value.
   * Otherwise, the texture is not used.
   *
   * If the templates are strings, they are appended to the default templates.
   * otherwise, they are used as regular expressions to replace the default templates.
   */
  createDissolveMaterial(
    mesh: Mesh<BufferGeometry, MeshBasicMaterial | ShaderMaterial>,
    vertexHeaderTemplate: string | RegExp = '#include <clipping_planes_pars_vertex>',
    vertexTemplate: string | RegExp = '#include <fog_vertex>',
    fragmentHeaderTemplate: string | RegExp = '#include <clipping_planes_pars_fragment>',
    fragmentTemplate: string | RegExp = '#include <opaque_fragment>'
  ) {
    const material = mesh.material
    const isShaderMaterial = 'isShaderMaterial' in material
    const texture: Texture = isShaderMaterial ? material.uniforms.map.value : material.map
    if (!mesh.geometry.boundingBox) {
      mesh.geometry.computeBoundingBox()
    }
    const minY = mesh.geometry.boundingBox!.min.y
    const maxY = mesh.geometry.boundingBox!.max.y
    const height = maxY - minY

    let uniforms = {
      progress: {
        value: 0
      },
      loadedHeight: {
        value: 0
      },
      jitterWidth: {
        value: 0.1 * height
      },
      repeat: {
        value: texture.repeat
      },
      offset: {
        value: texture.offset
      },
      origin_texture: {
        value: texture
      }
    }

    let vertexShader = '',
      fragmentShader = ''
    if (isShaderMaterial) {
      vertexShader = material.vertexShader
      fragmentShader = material.fragmentShader
      uniforms = UniformsUtils.merge([material.uniforms, uniforms])
    } else {
      const shader = ShaderLib['basic']
      vertexShader = shader.vertexShader
      fragmentShader = shader.fragmentShader
      Object.keys(shader.uniforms).forEach((key) => {
        if (material[key]) {
          uniforms[key] = shader.uniforms[key]
        }
      })
    }

    uniforms = UniformsUtils.merge([UniformsLib['lights'], uniforms])

    let vertexShaderHeader = `
varying vec2 vUv;
varying float positionY;`
    if (typeof vertexHeaderTemplate === 'string') {
      vertexShaderHeader = vertexHeaderTemplate + vertexShaderHeader
    }

    let vertexShaderMain = `
vUv = uv;
positionY = position.y;`
    if (typeof vertexTemplate === 'string') {
      vertexShaderMain = vertexTemplate + vertexShaderMain
    }

    let fragmentShaderHeader = `
varying vec2 vUv;
varying float positionY;
uniform float loadedHeight;
uniform vec2 repeat;
uniform vec2 offset;
uniform sampler2D origin_texture;
uniform float jitterWidth;
uniform float progress;

vec4 sRGBToLinear( in vec4 value ) {
  return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}`
    if (typeof fragmentHeaderTemplate === 'string') {
      fragmentShaderHeader = fragmentHeaderTemplate + fragmentShaderHeader
    }

    const textureShader =
      'isVideoTexture' in texture ? 'gl_FragColor = sRGBToLinear(textureColor);' : 'gl_FragColor = textureColor;'

    let fragmentShaderMain = `
float offset2 = positionY - loadedHeight;

vec2 transformedUV = vUv*repeat + offset;
vec4 textureColor = texture2D(origin_texture, transformedUV);

float jitterDelta = (rand(gl_FragCoord.xy) - 0.5) * 200.0; // [-100, 100]
float localJitter = jitterWidth * (100.0 + jitterDelta) / 100.0;

float lowerOffset = loadedHeight - localJitter;
float upperOffset = loadedHeight + localJitter;

float randomR = (sin(progress) * 0.5) + 0.5;
float randomG = .5;
float randomB = (cos(progress) * 0.5) + 0.5;

if (positionY < lowerOffset) {
  ${textureShader}
} else if (positionY > upperOffset) {
  discard;
} else {
  gl_FragColor.r = randomR;
  gl_FragColor.g = randomG;
  gl_FragColor.b = randomB;
}`
    if (typeof fragmentTemplate === 'string') {
      fragmentShaderMain = fragmentTemplate + fragmentShaderMain
    }

    vertexShader = vertexShader.replace(vertexHeaderTemplate, vertexShaderHeader)
    vertexShader = vertexShader.replace(vertexTemplate, vertexShaderMain)

    fragmentShader = fragmentShader.replace(fragmentHeaderTemplate, fragmentShaderHeader)
    fragmentShader = fragmentShader.replace(fragmentTemplate, fragmentShaderMain)

    const newMaterial = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      lights: true,
      fog: false,
      transparent: material.transparent
    })
    newMaterial.needsUpdate = true
    newMaterial.visible = material.visible

    return newMaterial
  },

  /**
   * Interpolates the duration to bounding box's minY and maxY.
   * Returns true when the loading effect is finished.
   */
  updateDissolveEffect(entity: Entity, mesh: Mesh<BufferGeometry, ShaderMaterial>, deltaTime: number) {
    const dissolveComponent = getComponent(entity, UVOLDissolveComponent)
    if (!dissolveComponent) return true

    if (!mesh.material.uniforms.progress) return true

    dissolveComponent.currentTime += deltaTime
    if (!mesh.geometry.boundingBox) {
      mesh.geometry.computeBoundingBox()
    }
    const minY = mesh.geometry.boundingBox!.min.y
    const maxY = mesh.geometry.boundingBox!.max.y
    const duration = dissolveComponent.duration

    const loadedHeight = Math.min(
      maxY,
      Math.max(minY, minY + (maxY - minY) * (dissolveComponent.currentTime / duration))
    )

    mesh.material.uniforms.loadedHeight.value = loadedHeight
    mesh.material.uniforms.progress.value = dissolveComponent.currentTime / duration

    return dissolveComponent.currentTime >= duration
  }
})
