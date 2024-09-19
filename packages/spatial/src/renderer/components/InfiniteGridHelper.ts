import { useEffect } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  LineBasicMaterial,
  NormalBlending,
  Plane,
  PlaneGeometry,
  ShaderMaterial
} from 'three'

import { Entity } from '@xrengine/ecs'
import { defineComponent, setComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { useMutableState } from '@xrengine/hyperflux'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { NameComponent } from '../../common/NameComponent'
import { setVisibleComponent } from '../../renderer/components/VisibleComponent'
import { useResource } from '../../resources/resourceHooks'
import { RendererState } from '../RendererState'
import LogarithmicDepthBufferMaterialChunk from '../constants/LogarithmicDepthBufferMaterialChunk'
import { LineSegmentComponent } from './LineSegmentComponent'
import { useMeshComponent } from './MeshComponent'

/**
 * Original Author: Fyrestar
 * https://discourse.threejs.org/t/three-infinitegridhelper-anti-aliased/8377
 */
const vertexShaderGrid = `
varying vec3 worldPosition;
      
uniform float uDistance;
#include <logdepthbuf_pars_vertex>
${LogarithmicDepthBufferMaterialChunk}

void main() {

  vec3 pos = position.xzy * uDistance;
  pos.xz += cameraPosition.xz;
  // avoid z fighting
  // pos.y += 0.01;

  worldPosition = pos;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

  #include <logdepthbuf_vertex>
}
`

const fragmentShaderGrid = `
varying vec3 worldPosition;

uniform float uSize1;
uniform float uSize2;
uniform vec3 uColor;
uniform float uDistance;

#include <logdepthbuf_pars_fragment>

float getGrid(float size) {
    vec2 r = worldPosition.xz / size;
    vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
    float line = min(grid.x, grid.y);
    return 1.0 - min(line, 1.0);
}

float getXAxisLine() {
  float lineWidth = 0.1; // Adjust line width if needed
  float xLine = smoothstep(-lineWidth, lineWidth, abs(worldPosition.x));
  return 1.0 - xLine;
}

float getZAxisLine() {
  float lineWidth = 0.1; // Adjust line width if needed
  float zLine = smoothstep(-lineWidth, lineWidth, abs(worldPosition.z));
  return 1.0 - zLine;
}

void main() {
  #include <logdepthbuf_fragment>

  float d = 1.0 - min(distance(cameraPosition.xz, worldPosition.xz) / uDistance, 1.0);

  float g1 = getGrid(uSize1);
  float g2 = getGrid(uSize2);
  float xAxisLine = getXAxisLine();
  float zAxisLine = getZAxisLine();

  if (xAxisLine > 0.0 || zAxisLine > 0.0) {
    discard;
  } else {
    gl_FragColor = vec4(uColor.rgb, mix(g2, g1, g1));
    gl_FragColor.a = mix(0.5 * gl_FragColor.a, gl_FragColor.a, g2);
    gl_FragColor.a *= pow(d, 3.0);
}

  if ( gl_FragColor.a <= 0.0 ) discard;
}
`

export const InfiniteGridComponent = defineComponent({
  name: 'InfiniteGridComponent',

  schema: S.Object({
    size: S.Number(1),
    color: S.Color(0x535353),
    distance: S.Number(200)
  }),

  reactor: () => {
    const entity = useEntityContext()

    const component = useComponent(entity, InfiniteGridComponent)
    const engineRendererSettings = useMutableState(RendererState)
    const mesh = useMeshComponent(
      entity,
      () => new PlaneGeometry(2, 2, 1, 1),
      () =>
        new ShaderMaterial({
          side: DoubleSide,
          uniforms: {},
          transparent: true,
          vertexShader: vertexShaderGrid,
          fragmentShader: fragmentShaderGrid,
          polygonOffset: true,
          polygonOffsetFactor: -1,
          polygonOffsetUnits: 0.01,
          extensions: {
            derivatives: true
          }
        })
    )
    const [plane] = useResource(() => new Plane(mesh.up.value), entity)

    useEffect(() => {
      mesh.position.y.set(engineRendererSettings.gridHeight.value)
      mesh.value.updateMatrixWorld(true)
    }, [engineRendererSettings.gridHeight])

    useEffect(() => {
      mesh.material.uniforms.uColor.set({
        value: component.color.value
      })
    }, [component.color])

    useEffect(() => {
      const size = component.size.value
      mesh.material.uniforms.uSize1.set({
        value: size
      })
      mesh.material.uniforms.uSize2.set({
        value: size * 10
      })
    }, [component.size])

    useEffect(() => {
      mesh.material.uniforms.uDistance.set({
        value: component.distance.value
      })

      const lineEntities = [] as Entity[]
      const lineColors = ['red', 'green', 'blue']
      for (let i = 0; i < lineColors.length; i++) {
        const lineGeometry = new BufferGeometry()
        const floatArray = [0, 0, 0, 0, 0, 0]
        floatArray[i] = -component.distance.value
        floatArray[i + 3] = component.distance.value
        const linePositions = new Float32Array(floatArray)
        lineGeometry.setAttribute('position', new BufferAttribute(linePositions, 3))
        const lineMaterial = new LineBasicMaterial({
          side: DoubleSide,
          color: lineColors[i],
          transparent: true,
          opacity: 0.3,
          linewidth: 2,
          blending: NormalBlending,
          depthTest: true,
          depthWrite: true
        })

        const lineEntity = createEntity()
        setComponent(lineEntity, LineSegmentComponent, {
          name: `infinite-grid-helper-line-${i}`,
          geometry: lineGeometry,
          material: lineMaterial
        })
        setComponent(lineEntity, EntityTreeComponent, { parentEntity: entity })
        lineEntities.push(lineEntity)
      }

      return () => {
        for (const lineEntity of lineEntities) removeEntity(lineEntity)
      }
    }, [component.distance])

    return null
  }
})

export const createInfiniteGridHelper = () => {
  const entity = createEntity()
  setComponent(entity, EntityTreeComponent)
  setComponent(entity, InfiniteGridComponent)
  setComponent(entity, NameComponent, 'Infinite Grid Helper')
  setVisibleComponent(entity, true)
  return entity
}
