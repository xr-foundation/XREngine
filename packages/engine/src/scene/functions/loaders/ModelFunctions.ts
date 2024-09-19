
import { DracoOptions } from '@gltf-transform/functions'
import { Material, Texture } from 'three'

import { UUIDComponent } from '@xrengine/ecs'
import {
  getComponent,
  getOptionalComponent,
  hasComponent,
  useOptionalComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { MeshComponent } from '@xrengine/spatial/src/renderer/components/MeshComponent'
import { iterateEntityNode } from '@xrengine/spatial/src/transform/components/EntityTree'

import {
  GeometryTransformParameters,
  ImageTransformParameters,
  ModelTransformParameters,
  ResourceID,
  ResourceTransforms
} from '../../../assets/classes/ModelTransform'
import { ModelComponent } from '../../components/ModelComponent'

export function getModelSceneID(entity: Entity): string {
  if (!hasComponent(entity, ModelComponent) || !hasComponent(entity, UUIDComponent)) {
    return ''
  }
  return getComponent(entity, UUIDComponent) + '-' + getComponent(entity, ModelComponent).src
}

export function useModelSceneID(entity: Entity): string {
  const uuid = useOptionalComponent(entity, UUIDComponent)?.value
  const model = useOptionalComponent(entity, ModelComponent)?.value
  if (!uuid || !model) return ''
  return uuid + '-' + model.src
}

export function getModelResources(entity: Entity, defaultParms: ModelTransformParameters): ResourceTransforms {
  const model = getOptionalComponent(entity, ModelComponent)
  if (!model?.scene) return { geometries: [], images: [] }
  const geometries: GeometryTransformParameters[] = iterateEntityNode(entity, (entity) => {
    if (!hasComponent(entity, MeshComponent)) return []
    const mesh = getOptionalComponent(entity, MeshComponent)
    if (!mesh?.isMesh || !mesh.geometry) return []
    mesh.name && (mesh.geometry.name = mesh.name)
    return [mesh.geometry]
  })
    .flatMap((x) => x)
    .map((geometry) => {
      const dracoParms: DracoOptions = {
        quantizePosition: 14,
        quantizeNormal: 10,
        quantizeTexcoord: 12,
        quantizeColor: 8,
        quantizeGeneric: 12
      }
      return {
        resourceId: geometry.uuid as ResourceID,
        isParameterOverride: true,
        enabled: true,
        parameters: {
          weld: {
            isParameterOverride: true,
            enabled: false,
            parameters: 0.0001
          },
          dracoCompression: {
            isParameterOverride: true,
            enabled: false,
            parameters: dracoParms
          }
        }
      } as GeometryTransformParameters
    })
    .filter((x, i, arr) => arr.indexOf(x) === i) // remove duplicates

  const visitedMaterials: Set<Material> = new Set()
  const images: ImageTransformParameters[] = iterateEntityNode(entity, (entity) => {
    const mesh = getOptionalComponent(entity, MeshComponent)
    if (!mesh?.isMesh || !mesh.material || visitedMaterials.has(mesh.material as Material)) return []
    visitedMaterials.add(mesh.material as Material)
    const textures: Texture[] = Object.entries(mesh.material)
      .filter(([, x]) => x?.isTexture)
      .map(([field, texture]) => {
        texture.name = texture.name ? texture.name : `${(mesh.material as Material).name}-${field}`
        return texture
      })
    const tmpImages: HTMLImageElement[] = textures.map((texture) => texture.image)
    const images: [HTMLImageElement, string][] = textures
      .filter((texture, i, arr) => tmpImages.indexOf(tmpImages[i]) === i)
      .map((texture) => {
        const image = texture.image as HTMLImageElement
        image.id = texture.name
        let descriptor = ''
        if (/normal/i.test(texture.name)) {
          descriptor = 'normalMap'
        }
        if (/base[-_\s]*color/i.test(texture.name) || /diffuse/i.test(texture.name)) {
          descriptor = 'baseColorMap'
        }
        return [image, descriptor]
      })
    const result: ImageTransformParameters[] = images.map(([image, descriptor]) => {
      const imageParms = {
        resourceId: image.id as ResourceID,
        isParameterOverride: true,
        enabled: !!descriptor,
        parameters: {
          flipY: {
            enabled: false,
            isParameterOverride: true,
            parameters: false
          },
          maxTextureSize: {
            enabled: false,
            isParameterOverride: true,
            parameters: 1024
          },
          textureFormat: {
            enabled: false,
            isParameterOverride: true,
            parameters: 'ktx2'
          },
          textureCompressionType: {
            enabled: false,
            isParameterOverride: true,
            parameters: 'etc1'
          },
          textureCompressionQuality: {
            enabled: false,
            isParameterOverride: true,
            parameters: 128
          }
        }
      } as ImageTransformParameters
      if (descriptor === 'normalMap') {
        imageParms.parameters.textureCompressionType.enabled = true
        imageParms.parameters.textureCompressionType.parameters = 'uastc'
      }
      if (descriptor === 'baseColorMap') {
        imageParms.parameters.maxTextureSize.enabled = true
        imageParms.parameters.maxTextureSize.parameters = defaultParms.maxTextureSize * 2
      }
      return imageParms
    })
    return result
  })
    .flatMap((x) => x)
    .filter((x, i, arr) => arr.indexOf(x) === i) // remove duplicates
  return {
    geometries,
    images
  }
}
