import { MeshMatcapMaterial as Matcap } from 'three'

import { BasicArgs, BumpMapArgs, DisplacementMapArgs, NormalMapArgs } from '../constants/BasicArgs'
import { BoolArg, TextureArg } from '../constants/DefaultArgs'
import { MaterialPrototypeDefinition } from '../MaterialComponent'

export const MeshMatcapArguments = {
  ...BasicArgs,
  ...BumpMapArgs,
  fog: BoolArg,
  matcap: TextureArg,
  ...NormalMapArgs,
  ...DisplacementMapArgs
}

export const MeshMatcapMaterial: MaterialPrototypeDefinition = {
  prototypeId: 'MeshMatcapMaterial',
  arguments: MeshMatcapArguments,
  prototypeConstructor: Matcap,
  onBeforeCompile: (shader, renderer) => {
    ;['envMap', 'flipEnvMap', 'reflectivity', 'ior', 'refractionRatio'].map(
      (arg) => (shader.uniforms[arg] = { value: null })
    )
  }
}

export default MeshMatcapMaterial
