
import { MeshStandardMaterial as Standard } from 'three'

import { MaterialPrototypeDefinition } from '@xrengine/spatial/src/renderer/materials/MaterialComponent'

import {
  AoMapArgs,
  BasicArgs,
  BumpMapArgs,
  DisplacementMapArgs,
  EmissiveMapArgs,
  EnvMapArgs,
  LightMapArgs,
  MetalnessMapArgs,
  NormalMapArgs,
  RoughhnessMapArgs
} from '../constants/BasicArgs'

export const MeshStandardArguments = {
  ...BasicArgs,
  ...EmissiveMapArgs,
  ...EnvMapArgs,
  ...NormalMapArgs,
  ...BumpMapArgs,
  ...DisplacementMapArgs,
  ...RoughhnessMapArgs,
  ...MetalnessMapArgs,
  ...AoMapArgs,
  ...LightMapArgs
}

export const MeshStandardMaterial: MaterialPrototypeDefinition = {
  prototypeId: 'MeshStandardMaterial',
  prototypeConstructor: Standard,
  arguments: MeshStandardArguments
}

export default MeshStandardMaterial
