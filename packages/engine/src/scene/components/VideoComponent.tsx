
import { useEffect } from 'react'
import {
  ClampToEdgeWrapping,
  CompressedTexture,
  DoubleSide,
  LinearFilter,
  Mesh,
  MirroredRepeatWrapping,
  PlaneGeometry,
  RepeatWrapping,
  ShaderMaterial,
  SphereGeometry,
  Texture,
  Uniform,
  Vector2,
  VideoTexture
} from 'three'

import { UUIDComponent } from '@xrengine/ecs'
import {
  defineComponent,
  getOptionalComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { createEntity, removeEntity, useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { defineState, NO_PROXY, useHookstate, useState } from '@xrengine/hyperflux'
import { isMobile } from '@xrengine/spatial/src/common/functions/isMobile'
import { createPriorityQueue } from '@xrengine/spatial/src/common/functions/PriorityQueue'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { MeshComponent, useMeshComponent } from '@xrengine/spatial/src/renderer/components/MeshComponent'
import { setVisibleComponent, VisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'
import { isMobileXRHeadset } from '@xrengine/spatial/src/xr/XRState'
import { ContentFitTypeSchema } from '@xrengine/spatial/src/xrui/functions/ObjectFitFunctions'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { clearErrors } from '../functions/ErrorFunctions'
import { getTextureSize, PLANE_GEO, resizeVideoMesh, SideSchema, SPHERE_GEO } from './ImageComponent'
import { MediaElementComponent } from './MediaComponent'

export const VideoTexturePriorityQueueState = defineState({
  name: 'VideoTexturePriorityQueueState',
  initial: () => {
    const accumulationBudget = isMobileXRHeadset || isMobile ? 1 : 3
    return {
      queue: createPriorityQueue({
        accumulationBudget
      })
    }
  }
})

class VideoTexturePriorityQueue extends VideoTexture {
  constructor(video) {
    super(video)
    this.minFilter = LinearFilter
    this.magFilter = LinearFilter
    this.generateMipmaps = false
  }
  update() {}
}

const WrappingSchema = S.LiteralUnion(
  [RepeatWrapping, ClampToEdgeWrapping, MirroredRepeatWrapping],
  ClampToEdgeWrapping
)

const ProjectionSchema = S.LiteralUnion(['Flat', 'Equirectangular360'], 'Flat')

export const VideoComponent = defineComponent({
  name: 'XRENGINE_video',
  jsonID: 'XRENGINE_video',

  schema: S.Object({
    side: SideSchema(DoubleSide),
    size: S.Vec2({ x: 1, y: 1 }),
    uvOffset: S.Vec2({ x: 0, y: 0 }),
    uvScale: S.Vec2({ x: 1, y: 1 }),
    alphaUVOffset: S.Vec2({ x: 0, y: 0 }),
    alphaUVScale: S.Vec2({ x: 1, y: 1 }),
    wrapS: WrappingSchema,
    wrapT: WrappingSchema,
    useAlpha: S.Bool(false),
    useAlphaUVTransform: S.Bool(false),
    alphaThreshold: S.Number(0.5),
    fit: ContentFitTypeSchema('contain'),
    projection: ProjectionSchema,
    mediaUUID: S.EntityUUID(),
    // internal
    videoMeshEntity: S.Entity(),
    texture: S.Nullable(S.Type<VideoTexturePriorityQueue>())
  }),

  onRemove: (entity, component) => {
    if (VideoComponent.uniqueVideoEntities.includes(entity)) {
      VideoComponent.uniqueVideoEntities.splice(VideoComponent.uniqueVideoEntities.indexOf(entity), 1)
    }
  },

  errors: ['INVALID_MEDIA_UUID', 'MISSING_MEDIA_ELEMENT'],

  uniqueVideoEntities: [] as Entity[],

  reactor: VideoReactor
})

function VideoReactor() {
  const entity = useEntityContext()
  const video = useComponent(entity, VideoComponent)
  const visible = useOptionalComponent(entity, VisibleComponent)
  const mediaUUID = video.mediaUUID.value
  const mediaEntity = UUIDComponent.getEntityByUUID(mediaUUID) || entity
  const mediaElement = useOptionalComponent(mediaEntity, MediaElementComponent)

  const videoMeshEntity = useHookstate(createEntity)
  const mesh = useMeshComponent<PlaneGeometry | SphereGeometry, ShaderMaterial>(
    videoMeshEntity.value,
    PLANE_GEO,
    () =>
      new ShaderMaterial({
        uniforms: {
          map: { value: null },
          alphaMap: { value: null },
          uvOffset: { value: new Vector2(0, 0) },
          uvScale: { value: new Vector2(1, 1) },
          useAlpha: { value: false },
          alphaThreshold: { value: 0.5 },
          useAlphaUVTransform: { value: false },
          alphaUVOffset: { value: new Vector2(0, 0) },
          alphaUVScale: { value: new Vector2(1, 1) },
          wrapS: { value: ClampToEdgeWrapping },
          wrapT: { value: ClampToEdgeWrapping }
        },
        vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }

      `,
        fragmentShader: `
      #ifdef USE_MAP
        uniform sampler2D map;
      #endif
        uniform bool useAlpha;
        uniform float alphaThreshold;
        uniform vec2 uvOffset;
        uniform vec2 uvScale;
        uniform bool useAlphaUVTransform;
        uniform vec2 alphaUVOffset;
        uniform vec2 alphaUVScale;
        uniform int wrapS;
        uniform int wrapT;

        varying vec2 vUv;

        vec2 applyWrapping(vec2 uv, int wrapS, int wrapT) {
          vec2 wrappedUv = uv;
          // Repeat Wrapping
          if (wrapS == 1000) {
            wrappedUv.x = fract(wrappedUv.x);
          } else if (wrapS == 1002) {
            float mirrored = mod(wrappedUv.x, 2.0);
            if (mirrored > 1.0) mirrored = 2.0 - mirrored;
            wrappedUv.x = mirrored;
          } else {
            wrappedUv.x = clamp(wrappedUv.x, 0.0, 1.0);
          }
          
          if (wrapT == 1000) {
            wrappedUv.y = fract(wrappedUv.y);
          } else if (wrapT == 1002) {
            float mirrored = mod(wrappedUv.y, 2.0);
            if (mirrored > 1.0) mirrored = 2.0 - mirrored;
            wrappedUv.y = mirrored;
          } else {
            wrappedUv.y = clamp(wrappedUv.y, 0.0, 1.0);
          }
          return wrappedUv;
        }



        void main() {
        #ifdef USE_MAP
          vec2 mapUv = applyWrapping(vUv * uvScale + uvOffset, wrapS, wrapT);
          vec4 color = texture2D(map, mapUv);
          color.rgb = pow(color.rgb, vec3(2.2));
          if (useAlpha) {
            if (useAlphaUVTransform) {
                vec2 alphaMapUv = applyWrapping(vUv * alphaUVScale + alphaUVOffset, wrapS, wrapT);
                vec4 alphaColor = texture2D(map, alphaMapUv);
                float intensity = alphaColor.r * 0.3 + alphaColor.g * 0.59 + alphaColor.b * 0.11;
                if (intensity < alphaThreshold) discard;
            } else {
                float intensity = color.r * 0.3 + color.g * 0.59 + color.b * 0.11;
                if (intensity < alphaThreshold) discard;
            }
          }
          gl_FragColor = color;
        #else
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        #endif
        }
      `
      })
  )

  const fitPlacementUvOffset = useState(new Vector2(0, 0))
  const fitPlacementUvScale = useState(new Vector2(1, 1))

  useEffect(() => {
    const videoEntity = videoMeshEntity.value
    video.videoMeshEntity.set(videoEntity)
    mesh.name.set(`video-group-${entity}`)
    setComponent(videoEntity, EntityTreeComponent, { parentEntity: entity })
    setComponent(videoEntity, NameComponent, mesh.name.value)
    return () => {
      removeEntity(videoEntity)
    }
  }, [])

  useEffect(() => {
    setVisibleComponent(videoMeshEntity.value, !!visible)
  }, [visible])

  // update side
  useEffect(() => {
    mesh.material.side.set(video.side.value)
  }, [video.side])

  // update mesh
  useEffect(() => {
    const videoMesh = mesh.value as Mesh<PlaneGeometry | SphereGeometry, ShaderMaterial>
    resizeVideoMesh(videoMesh)

    const uvOffset = new Vector2(0, 0)
    const uvScale = new Vector2(1, 1)

    const containerWidth = video.size.width.value
    const containerHeight = video.size.height.value
    const containerRatio = containerWidth / containerHeight

    videoMesh.scale.x = containerWidth
    videoMesh.scale.y = containerHeight

    const imageSize = getTextureSize(videoMesh.material.uniforms.map.value as Texture | CompressedTexture)
    const imageRatio = imageSize.x / imageSize.y || 1

    let isPlacementHorz = true
    if (video.fit.value == 'horizontal') {
      isPlacementHorz = true
    }
    if (video.fit.value == 'vertical') {
      isPlacementHorz = false
    }
    if (video.fit.value == 'contain') {
      if (imageRatio > containerRatio) {
        isPlacementHorz = true
      } else {
        isPlacementHorz = false
      }
    }
    if (video.fit.value == 'cover') {
      if (imageRatio > containerRatio) {
        isPlacementHorz = false
      } else {
        isPlacementHorz = true
      }
    }

    if (isPlacementHorz) {
      uvScale.y = imageRatio / containerRatio
      uvScale.x = 1
      uvOffset.y = (1 - uvScale.y) / 2
    } else {
      uvScale.x = 1 / imageRatio / (1 / containerRatio)
      uvScale.y = 1
      uvOffset.x = (1 - uvScale.x) / 2
    }

    fitPlacementUvOffset.set(uvOffset)
    fitPlacementUvScale.set(uvScale)
  }, [video.size, video.fit, video.texture, mesh.material])

  useEffect(() => {
    mesh.geometry.set(video.projection.value === 'Flat' ? PLANE_GEO() : SPHERE_GEO())
    mesh.geometry.attributes.position.needsUpdate.set(true)
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.map.value = video.texture.value
    const defines = mesh.material.defines.get(NO_PROXY) as Record<string, any>
    if (video.texture.value) {
      defines.USE_MAP = ''
    } else {
      delete defines.USE_MAP
    }
    mesh.material.needsUpdate.set(true)
  }, [video.texture, video.projection])

  useEffect(() => {
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.wrapS.value = video.wrapS.value
  }, [video.wrapS])

  useEffect(() => {
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.wrapT.value = video.wrapT.value
  }, [video.wrapT])

  useEffect(() => {
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.useAlpha.value = video.useAlpha.value
  }, [video.useAlpha])

  useEffect(() => {
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.alphaThreshold.value = video.alphaThreshold.value
  }, [video.alphaThreshold])

  useEffect(() => {
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.uvOffset.value = new Vector2(
      video.uvOffset.x.value + fitPlacementUvOffset.x.value,
      video.uvOffset.y.value + fitPlacementUvOffset.y.value
    )
  }, [video.uvOffset, fitPlacementUvOffset])

  useEffect(() => {
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.uvScale.value = video.uvScale.value

    uniforms.uvScale.value = new Vector2(
      video.uvScale.x.value * fitPlacementUvScale.x.value,
      video.uvScale.y.value * fitPlacementUvScale.y.value
    )
  }, [video.uvScale, fitPlacementUvScale])

  useEffect(() => {
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.useAlphaUVTransform.value = video.useAlphaUVTransform.value
  }, [video.useAlphaUVTransform])

  useEffect(() => {
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.alphaUVOffset.value = video.alphaUVOffset.value
  }, [video.alphaUVOffset])

  useEffect(() => {
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.alphaUVScale.value = video.alphaUVScale.value
  }, [video.alphaUVScale])

  useEffect(() => {
    if (!mediaEntity || !mediaElement) return
    const sourceVideoComponent = getOptionalComponent(mediaEntity, VideoComponent)
    const sourceMeshComponent = getOptionalComponent(mediaEntity, MeshComponent)
    const sourceTexture = sourceVideoComponent?.texture
    if (video.texture.value) {
      ;(video.texture.value.image as HTMLVideoElement) = mediaElement.element.value as HTMLVideoElement
      clearErrors(entity, VideoComponent)
    } else {
      if (sourceTexture && sourceMeshComponent) {
        mesh.material.set(sourceMeshComponent.material as ShaderMaterial)
        clearErrors(entity, VideoComponent)
      } else {
        video.texture.set(new VideoTexturePriorityQueue(mediaElement.element.value as HTMLVideoElement))
        VideoComponent.uniqueVideoEntities.push(mediaEntity)
        clearErrors(entity, VideoComponent)
        return () => {
          if (VideoComponent.uniqueVideoEntities.includes(entity)) {
            VideoComponent.uniqueVideoEntities.splice(VideoComponent.uniqueVideoEntities.indexOf(entity), 1)
          }
        }
      }
    }
  }, [video.texture, mediaEntity, mediaElement])
  return null
}
