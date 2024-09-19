import { VRM } from '@pixiv/three-vrm'

import { getComponent, getOptionalMutableComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { ECSState } from '@xrengine/ecs/src/ECSState'
import { defineQuery } from '@xrengine/ecs/src/QueryFunctions'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { getState } from '@xrengine/hyperflux'
import { VisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'
import { TweenComponent } from '@xrengine/spatial/src/transform/components/TweenComponent'

import { TransformDirtyUpdateSystem } from '@xrengine/spatial/src/transform/systems/TransformSystem'
import { ModelComponent } from '../../scene/components/ModelComponent'
import { AnimationComponent } from '.././components/AnimationComponent'
import { LoopAnimationComponent } from '../components/LoopAnimationComponent'
import { updateVRMRetargeting } from '../functions/updateVRMRetargeting'

const tweenQuery = defineQuery([TweenComponent])
const animationQuery = defineQuery([AnimationComponent, VisibleComponent])
const loopAnimationQuery = defineQuery([AnimationComponent, LoopAnimationComponent, ModelComponent, TransformComponent])

const execute = () => {
  const { deltaSeconds } = getState(ECSState)

  for (const entity of tweenQuery()) {
    const tween = getComponent(entity, TweenComponent)
    tween.update()
  }

  for (const entity of animationQuery()) {
    const animationComponent = getComponent(entity, AnimationComponent)
    const modifiedDelta = deltaSeconds
    animationComponent.mixer.update(modifiedDelta)
    const animationActionComponent = getOptionalMutableComponent(entity, LoopAnimationComponent)
    animationActionComponent?._action.value &&
      animationActionComponent?.time.set(animationActionComponent._action.value.time)
  }

  for (const entity of loopAnimationQuery()) {
    const model = getComponent(entity, ModelComponent)
    if (model.asset instanceof VRM) {
      updateVRMRetargeting(model.asset, entity)
    }
  }
}

export const AnimationSystem = defineSystem({
  uuid: 'xrengine.engine.AnimationSystem',
  insert: { before: TransformDirtyUpdateSystem },
  execute
})
