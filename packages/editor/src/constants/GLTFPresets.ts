import {
  DefaultModelTransformParameters as defaultParams,
  ModelTransformParameters
} from '@xrengine/engine/src/assets/classes/ModelTransform'

export type LODVariantDescriptor = {
  params: ModelTransformParameters
  suffix: string
  variantMetadata: Record<string, any>
}

export const LODList: LODVariantDescriptor[] = [
  {
    params: {
      ...defaultParams,
      src: 'Desktop - Low',
      dst: 'Desktop - Low',
      maxTextureSize: 1024
    },
    suffix: 'desktop-low',
    variantMetadata: { device: 'DESKTOP' }
  },
  {
    params: {
      ...defaultParams,
      src: 'Desktop - Medium',
      dst: 'Desktop - Medium',
      maxTextureSize: 2048
    },
    suffix: 'desktop-medium',
    variantMetadata: { device: 'DESKTOP' }
  },
  {
    params: {
      ...defaultParams,
      src: 'Desktop - High',
      dst: 'Desktop - High',
      maxTextureSize: 2048
    },
    suffix: 'desktop-high',
    variantMetadata: { device: 'DESKTOP' }
  },
  {
    params: {
      ...defaultParams,
      src: 'Mobile - Low',
      dst: 'Mobile - Low',
      maxTextureSize: 512
    },
    suffix: 'mobile-low',
    variantMetadata: { device: 'MOBILE' }
  },
  {
    params: {
      ...defaultParams,
      src: 'Mobile - High',
      dst: 'Mobile - High',
      maxTextureSize: 512
    },
    suffix: 'mobile-high',
    variantMetadata: { device: 'MOBILE' }
  },
  {
    params: {
      ...defaultParams,
      src: 'XR - Low',
      dst: 'XR - Low',
      maxTextureSize: 1024
    },
    suffix: 'xr-low',
    variantMetadata: { device: 'XR' }
  },
  {
    params: {
      ...defaultParams,
      src: 'XR - Medium',
      dst: 'XR - Medium',
      maxTextureSize: 1024
    },
    suffix: 'xr-medium',
    variantMetadata: { device: 'XR' }
  },
  {
    params: {
      ...defaultParams,
      src: 'XR - High',
      dst: 'XR - High',
      maxTextureSize: 2048
    },
    suffix: 'xr-high',
    variantMetadata: { device: 'XR' }
  }
]

export const defaultLODs: LODVariantDescriptor[] = [
  {
    params: {
      ...defaultParams,
      src: '-LOD0',
      dst: '-LOD0',
      maxTextureSize: 2048
    },
    suffix: '-LOD0',
    variantMetadata: {}
  },
  {
    params: {
      ...defaultParams,
      src: '-LOD1',
      dst: '-LOD1',
      maxTextureSize: 1024,
      simplifyRatio: 0.85,
      simplifyErrorThreshold: 0.01
    },
    suffix: '-LOD1',
    variantMetadata: {}
  },
  {
    params: {
      ...defaultParams,
      src: '-LOD2',
      dst: '-LOD2',
      maxTextureSize: 512,
      simplifyRatio: 0.75,
      simplifyErrorThreshold: 0.01
    },
    suffix: '-LOD2',
    variantMetadata: {}
  }
]
