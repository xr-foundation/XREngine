
import { EntityUUID, SerializedComponentType } from '@xrengine/ecs'
import { DirectionalLightComponent } from '@xrengine/spatial'

import { RenderSettingsComponent } from '../components/RenderSettingsComponent'
import { SceneJsonType } from '../types/SceneTypes'

export const migrateDirectionalLightUseInCSM = (json: SceneJsonType) => {
  const renderSettingsEntity = Object.entries(json.entities).find(([, entity]) =>
    entity.components.find((c) => c.name === RenderSettingsComponent.jsonID)
  )
  const directionalLightEntity = Object.entries(json.entities).find(([, entity]) =>
    entity.components.find((c) => c.name === DirectionalLightComponent.jsonID && c.props.useInCSM === true)
  )
  if (!renderSettingsEntity || !directionalLightEntity) return

  const directionalLightComponent = directionalLightEntity[1].components.find(
    (c) => c.name === DirectionalLightComponent.jsonID
  )!.props as SerializedComponentType<typeof DirectionalLightComponent>
  const renderSettingsComponent = renderSettingsEntity[1].components.find(
    (c) => c.name === RenderSettingsComponent.jsonID
  )!.props as SerializedComponentType<typeof RenderSettingsComponent>

  renderSettingsComponent.primaryLight = directionalLightEntity[0] as EntityUUID

  /** @ts-ignore */
  delete directionalLightComponent.useInCSM
}
