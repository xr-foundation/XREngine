import { Color, CubeTexture, FogBase, Texture } from 'three'

import { defineComponent } from '@xrengine/ecs'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'

export const SceneComponent = defineComponent({
  name: 'SceneComponent'
})

export const BackgroundComponent = defineComponent({
  name: 'BackgroundComponent',
  schema: S.Type<Color | Texture | CubeTexture>()
})

export const EnvironmentMapComponent = defineComponent({
  name: 'EnvironmentMapComponent',
  schema: S.Type<Texture>()
})

export const FogComponent = defineComponent({
  name: 'FogComponent',
  schema: S.Type<FogBase>()
})
