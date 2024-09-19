
import { defineComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'

export const DefaultKillHeight = -10

export const SceneSettingsComponent = defineComponent({
  name: 'SceneSettingsComponent',
  jsonID: 'XRENGINE_scene_settings',

  schema: S.Object({
    thumbnailURL: S.String(''),
    loadingScreenURL: S.String(''),
    primaryColor: S.String('#000000'),
    backgroundColor: S.String('#FFFFFF'),
    alternativeColor: S.String('#000000'),
    sceneKillHeight: S.Number(DefaultKillHeight),
    spectateEntity: S.Nullable(S.EntityUUID())
  })
})
