import { PresentationSystemGroup } from '@xrengine/ecs'
import { getComponent, getMutableComponent, getOptionalComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { ECSState } from '@xrengine/ecs/src/ECSState'
import { defineQuery } from '@xrengine/ecs/src/QueryFunctions'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { getState } from '@xrengine/hyperflux'
import { isMobile } from '@xrengine/spatial/src/common/functions/isMobile'
import { EngineState } from '@xrengine/spatial/src/EngineState'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'

import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { SceneDynamicLoadTagComponent } from '../components/SceneDynamicLoadTagComponent'

let accumulator = 0

const distanceMultiplier = isMobile ? 0.5 : 1

const dynamicLoadQuery = defineQuery([SceneDynamicLoadTagComponent])

const execute = () => {
  const engineState = getState(EngineState)
  if (engineState.isEditor) return

  accumulator += getState(ECSState).deltaSeconds

  if (accumulator < 1) {
    return
  }

  accumulator = 0

  const selfAvatar = AvatarComponent.getSelfAvatarEntity()
  const avatarPosition = getOptionalComponent(selfAvatar, TransformComponent)?.position
  if (!avatarPosition) return

  for (const entity of dynamicLoadQuery()) {
    const dynamicComponent = getComponent(entity, SceneDynamicLoadTagComponent)
    if (dynamicComponent.mode !== 'distance') continue

    const transformComponent = getComponent(entity, TransformComponent)

    const distanceToAvatar = avatarPosition.distanceToSquared(transformComponent.position)
    const loadDistance = dynamicComponent.distance * dynamicComponent.distance * distanceMultiplier

    getMutableComponent(entity, SceneDynamicLoadTagComponent).loaded.set(distanceToAvatar < loadDistance)
  }
}

export const SceneObjectDynamicLoadSystem = defineSystem({
  uuid: 'xrengine.engine.scene.SceneObjectDynamicLoadSystem',
  insert: { after: PresentationSystemGroup },
  execute
})
