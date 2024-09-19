
import { Material, Shader, WebGLRenderer } from 'three'

import {
  Component,
  UUIDComponent,
  defineComponent,
  defineQuery,
  getComponent,
  getOptionalComponent,
  getOptionalMutableComponent,
  hasComponent
} from '@xrengine/ecs'
import { Entity, EntityUUID } from '@xrengine/ecs/src/Entity'
import { PluginType } from '@xrengine/spatial/src/common/functions/OnBeforeCompilePlugin'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { v4 as uuidv4 } from 'uuid'
import { NoiseOffsetPluginComponent } from './constants/plugins/NoiseOffsetPlugin'
import { TransparencyDitheringPluginComponent } from './constants/plugins/TransparencyDitheringComponent'
import { setMeshMaterial } from './materialFunctions'
import MeshBasicMaterial from './prototypes/MeshBasicMaterial.mat'
import MeshLambertMaterial from './prototypes/MeshLambertMaterial.mat'
import MeshMatcapMaterial from './prototypes/MeshMatcapMaterial.mat'
import MeshPhongMaterial from './prototypes/MeshPhongMaterial.mat'
import MeshPhysicalMaterial from './prototypes/MeshPhysicalMaterial.mat'
import MeshStandardMaterial from './prototypes/MeshStandardMaterial.mat'
import MeshToonMaterial from './prototypes/MeshToonMaterial.mat'
import { ShaderMaterial } from './prototypes/ShaderMaterial.mat'
import { ShadowMaterial } from './prototypes/ShadowMaterial.mat'
export type MaterialWithEntity = Material & { entity: Entity }

export type MaterialPrototypeConstructor = new (...args: any) => any
export type MaterialPrototypeObjectConstructor = { [key: string]: MaterialPrototypeConstructor }
export type MaterialPrototypeDefinition = {
  prototypeId: string
  prototypeConstructor: MaterialPrototypeConstructor
  arguments: PrototypeArgument
  onBeforeCompile?: (shader: Shader, renderer: WebGLRenderer) => void
}

export type PrototypeArgumentValue = {
  type: string
  default: any
  min?: number
  max?: number
  options?: any[]
}

export type PrototypeArgument = {
  [_: string]: PrototypeArgumentValue
}

export const MaterialPrototypeDefinitions = [
  MeshBasicMaterial,
  MeshStandardMaterial,
  MeshMatcapMaterial,
  MeshPhysicalMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshToonMaterial,
  ShaderMaterial,
  ShadowMaterial
] as MaterialPrototypeDefinition[]

export const MaterialPlugins = { TransparencyDitheringPluginComponent, NoiseOffsetPluginComponent } as Record<
  string,
  Component<any, any, any>
>

export const MaterialStateComponent = defineComponent({
  name: 'MaterialStateComponent',

  schema: S.Object({
    // material & material specific data
    material: S.Type<Material>({} as Material),
    parameters: S.Record(S.String(), S.Any()),
    // all entities using this material. an undefined entity at index 0 is a fake user
    instances: S.Array(S.Entity()),
    prototypeEntity: S.Entity()
  }),

  fallbackMaterial: uuidv4() as EntityUUID,

  onRemove: (entity) => {
    const materialComponent = getOptionalComponent(entity, MaterialStateComponent)
    if (!materialComponent) return
    for (const instanceEntity of materialComponent.instances) {
      if (!hasComponent(instanceEntity, MaterialInstanceComponent)) continue
      setMeshMaterial(instanceEntity, getComponent(instanceEntity, MaterialInstanceComponent).uuid)
    }
  }
})

export const MaterialInstanceComponent = defineComponent({
  name: 'MaterialInstanceComponent',

  schema: S.Object({ uuid: S.Array(S.EntityUUID()) }),

  onRemove: (entity) => {
    const uuids = getOptionalComponent(entity, MaterialInstanceComponent)?.uuid
    if (!uuids) return
    for (const uuid of uuids) {
      const materialEntity = UUIDComponent.getEntityByUUID(uuid)
      if (!hasComponent(materialEntity, MaterialStateComponent)) continue
      const materialComponent = getOptionalMutableComponent(materialEntity, MaterialStateComponent)
      if (materialComponent?.instances.value)
        materialComponent.instances.set(materialComponent.instances.value.filter((instance) => instance !== entity))
    }
  }
})

export const MaterialPrototypeComponent = defineComponent({
  name: 'MaterialPrototypeComponent',

  schema: S.Object({
    prototypeArguments: S.Type<PrototypeArgument>({}),
    prototypeConstructor: S.Type<MaterialPrototypeObjectConstructor>({})
  })
})

export const prototypeQuery = defineQuery([MaterialPrototypeComponent])

declare module 'three/src/materials/Material' {
  export interface Material {
    shader: Shader
    plugins?: PluginType[]
    _onBeforeCompile: typeof Material.prototype.onBeforeCompile
    needsUpdate: boolean
  }
}

declare module 'three/src/renderers/shaders/ShaderLib' {
  export interface Shader {
    uuid?: EntityUUID
  }
}
