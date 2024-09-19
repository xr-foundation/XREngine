
import { MeshPhysicalMaterial as Physical } from 'three'

import { ColorArg, FloatArg, NormalizedFloatArg, TextureArg } from '../constants/DefaultArgs'
import { MaterialPrototypeDefinition } from '../MaterialComponent'
import { MeshStandardArguments as StandardDefaults } from './MeshStandardMaterial.mat'

export const MeshPhysicalArguments = {
  ...StandardDefaults,
  clearcoat: { ...NormalizedFloatArg, default: 0.5 },
  clearcoatMap: TextureArg,
  clearcoatNormalMap: TextureArg,
  clearcoatRoughness: { ...NormalizedFloatArg, default: 0.5 },
  ior: { ...FloatArg, default: 1.5, min: 1.0, max: 2.333 },
  iridescence: NormalizedFloatArg,
  iridescenceMap: TextureArg,
  iridescenceIOR: { ...FloatArg, default: 1.3, min: 1.0, max: 2.333 },
  iridescenceThicknessMap: TextureArg,
  sheen: { ...NormalizedFloatArg, default: 0.5 },
  sheenMap: TextureArg,
  sheenColor: ColorArg,
  sheenColorMap: TextureArg,
  sheenRoughness: { ...NormalizedFloatArg, default: 0.5 },
  sheenRoughnessMap: TextureArg,
  specularIntensity: FloatArg,
  specularIntensityMap: TextureArg,
  specularColor: ColorArg,
  specularColorMap: TextureArg,
  thickness: FloatArg,
  thicknessMap: TextureArg,
  transmission: FloatArg,
  transmissionMap: TextureArg
}

export const MeshPhysicalMaterial: MaterialPrototypeDefinition = {
  prototypeId: 'MeshPhysicalMaterial',
  prototypeConstructor: Physical,
  arguments: MeshPhysicalArguments
}

export default MeshPhysicalMaterial
