import {
  Engine,
  Entity,
  PresentationSystemGroup,
  UUIDComponent,
  defineQuery,
  defineSystem,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  setComponent,
  useOptionalComponent,
  useQuery
} from '@xrengine/ecs'
import { getState, useHookstate } from '@xrengine/hyperflux'
import { TransformComponent } from '@xrengine/spatial'
import { FollowCameraComponent } from '@xrengine/spatial/src/camera/components/FollowCameraComponent'
import { XRState } from '@xrengine/spatial/src/xr/XRState'

import { EngineState } from '@xrengine/spatial/src/EngineState'
import { MaterialInstanceComponent } from '@xrengine/spatial/src/renderer/materials/MaterialComponent'
import {
  TransparencyDitheringPluginComponent,
  TransparencyDitheringRootComponent,
  ditherCalculationType
} from '@xrengine/spatial/src/renderer/materials/constants/plugins/TransparencyDitheringComponent'
import React, { useEffect } from 'react'
import { SourceComponent } from '../../scene/components/SourceComponent'
import { useModelSceneID } from '../../scene/functions/loaders/ModelFunctions'
import { AvatarComponent } from '../components/AvatarComponent'

const headDithering = 0
const cameraDithering = 1
const avatarQuery = defineQuery([AvatarComponent])
const execute = () => {
  const selfEntity = AvatarComponent.getSelfAvatarEntity()
  if (!selfEntity) return
  const cameraAttached = XRState.isCameraAttachedToAvatar

  for (const entity of avatarQuery()) {
    const transparencyDitheringRoot = getOptionalComponent(entity, TransparencyDitheringRootComponent)
    const materials = transparencyDitheringRoot?.materials
    if (!materials) setComponent(entity, TransparencyDitheringRootComponent, { materials: [] })

    const avatarComponent = getComponent(entity, AvatarComponent)
    const cameraComponent = getOptionalComponent(getState(EngineState).viewerEntity, FollowCameraComponent)

    if (!materials?.length) return
    for (const materialUUID of materials) {
      const pluginComponent = getOptionalComponent(
        UUIDComponent.getEntityByUUID(materialUUID),
        TransparencyDitheringPluginComponent
      )
      if (!pluginComponent) continue
      const viewerPosition = getComponent(Engine.instance.viewerEntity, TransformComponent).position
      pluginComponent.centers.value[cameraDithering].set(viewerPosition.x, viewerPosition.y, viewerPosition.z)
      pluginComponent.distances.value[cameraDithering] = cameraAttached ? 8 : 3
      pluginComponent.exponents.value[cameraDithering] = cameraAttached ? 10 : 6
      pluginComponent.useWorldCalculation.value[cameraDithering] = ditherCalculationType.worldTransformed
      if (entity !== selfEntity) {
        pluginComponent.distances.value[headDithering] = 10
        continue
      }
      pluginComponent.centers.value[headDithering].setY(avatarComponent.eyeHeight)
      pluginComponent.distances.value[headDithering] =
        cameraComponent && !cameraAttached ? Math.max(Math.pow(cameraComponent.distance * 5, 2.5), 3) : 3.5
      pluginComponent.exponents.value[headDithering] = cameraAttached ? 12 : 8
      pluginComponent.useWorldCalculation.value[headDithering] = ditherCalculationType.localPosition
    }
  }
}

export const AvatarTransparencySystem = defineSystem({
  uuid: 'AvatarTransparencySystem',
  execute,
  insert: { with: PresentationSystemGroup },
  reactor: () => {
    const selfEid = AvatarComponent.useSelfAvatarEntity()

    const avatarQuery = useQuery([AvatarComponent])

    return (
      <>
        {avatarQuery.map((childEntity) => (
          <AvatarReactor key={childEntity} entity={childEntity} />
        ))}
      </>
    )
  }
})

const AvatarReactor = (props: { entity: Entity }) => {
  const entity = props.entity
  const sceneInstanceID = useModelSceneID(entity)
  const childEntities = useHookstate(SourceComponent.entitiesBySourceState[sceneInstanceID])
  return (
    <>
      {childEntities.value?.map((childEntity) => (
        <DitherChildReactor key={childEntity} entity={childEntity} rootEntity={entity} />
      ))}
    </>
  )
}

const DitherChildReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const entity = props.entity
  const materialComponentUUID = useOptionalComponent(entity, MaterialInstanceComponent)?.uuid
  useEffect(() => {
    if (!materialComponentUUID?.value) return
    for (const materialUUID of materialComponentUUID.value) {
      const material = UUIDComponent.getEntityByUUID(materialUUID)
      const rootDitheringComponent = getMutableComponent(props.rootEntity, TransparencyDitheringRootComponent)
      if (!rootDitheringComponent.materials.value.includes(materialUUID))
        rootDitheringComponent.materials.set([...rootDitheringComponent.materials.value, materialUUID])
      setComponent(material, TransparencyDitheringPluginComponent)
    }
  }, [materialComponentUUID])
  return null
}
