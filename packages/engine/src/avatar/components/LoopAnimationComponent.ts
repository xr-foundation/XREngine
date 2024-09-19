import { VRM } from '@pixiv/three-vrm'
import { useEffect } from 'react'
import {
  AdditiveAnimationBlendMode,
  AnimationAction,
  AnimationClip,
  LoopOnce,
  LoopPingPong,
  LoopRepeat,
  NormalAnimationBlendMode
} from 'three'

import {
  defineComponent,
  getComponent,
  hasComponent,
  useComponent,
  useOptionalComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { NO_PROXY, isClient, useHookstate } from '@xrengine/hyperflux'
import { CallbackComponent, StandardCallbacks, setCallback } from '@xrengine/spatial/src/common/CallbackComponent'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { useGLTF } from '../../assets/functions/resourceLoaderHooks'
import { ModelComponent } from '../../scene/components/ModelComponent'
import { bindAnimationClipFromMixamo, retargetAnimationClip } from '../functions/retargetMixamoRig'
import { AnimationComponent } from './AnimationComponent'

const AnimationBlendMode = S.LiteralUnion(
  [NormalAnimationBlendMode, AdditiveAnimationBlendMode],
  NormalAnimationBlendMode
)

const AnimationActionLoopStyles = S.LiteralUnion([LoopOnce, LoopRepeat, LoopPingPong], LoopRepeat)

export const LoopAnimationComponent = defineComponent({
  name: 'LoopAnimationComponent',
  jsonID: 'XRENGINE_loop_animation',

  schema: S.Object({
    activeClipIndex: S.Number(-1),
    animationPack: S.String(''),

    // TODO: support blending multiple animation actions. Refactor into AnimationMixerComponent and AnimationActionComponent
    enabled: S.Bool(true),
    paused: S.Bool(false),
    time: S.Number(0),
    timeScale: S.Number(1),
    blendMode: AnimationBlendMode,
    loop: AnimationActionLoopStyles,
    repetitions: S.Number(Infinity),
    clampWhenFinished: S.Bool(false),
    zeroSlopeAtStart: S.Bool(true),
    zeroSlopeAtEnd: S.Bool(true),
    weight: S.Number(1),

    // internal
    _action: S.Nullable(S.Type<AnimationAction>())
  }),

  reactor: function () {
    if (!isClient) return null
    const entity = useEntityContext()

    const loopAnimationComponent = useComponent(entity, LoopAnimationComponent)
    const modelComponent = useOptionalComponent(entity, ModelComponent)
    const animComponent = useOptionalComponent(entity, AnimationComponent)
    const animationAction = loopAnimationComponent._action.value as AnimationAction

    const lastAnimationPack = useHookstate('')
    useEffect(() => {
      if (!animComponent?.animations?.value) return
      const clip = animComponent.animations.value[loopAnimationComponent.activeClipIndex.value] as AnimationClip
      const asset = modelComponent?.asset.get(NO_PROXY) ?? null
      if (!modelComponent || !asset?.scene || !clip) {
        loopAnimationComponent._action.set(null)
        return
      }
      animComponent.mixer.time.set(0)
      const assetObject = modelComponent.asset.get(NO_PROXY)
      try {
        const action = animComponent.mixer.value.clipAction(
          assetObject instanceof VRM ? bindAnimationClipFromMixamo(clip, assetObject) : clip
        )
        loopAnimationComponent._action.set(action)
        return () => {
          action.stop()
        }
      } catch (e) {
        console.warn('Failed to bind animation in LoopAnimationComponent', entity, e)
      }
    }, [loopAnimationComponent.activeClipIndex, modelComponent?.asset, animComponent?.animations])

    useEffect(() => {
      if (animationAction?.isRunning()) {
        animationAction.paused = loopAnimationComponent.paused.value
      } else if (!animationAction?.isRunning() && !loopAnimationComponent.paused.value) {
        animationAction?.getMixer().stopAllAction()
        animationAction?.reset()
        animationAction?.play()
      }
    }, [loopAnimationComponent._action, loopAnimationComponent.paused])

    useEffect(() => {
      if (!animationAction) return
      animationAction.enabled = loopAnimationComponent.enabled.value
    }, [loopAnimationComponent._action, loopAnimationComponent.enabled])

    useEffect(() => {
      if (!animationAction) return
      animationAction.time = loopAnimationComponent.time.value
      animationAction.setLoop(loopAnimationComponent.loop.value, loopAnimationComponent.repetitions.value)
      animationAction.clampWhenFinished = loopAnimationComponent.clampWhenFinished.value
      animationAction.zeroSlopeAtStart = loopAnimationComponent.zeroSlopeAtStart.value
      animationAction.zeroSlopeAtEnd = loopAnimationComponent.zeroSlopeAtEnd.value
      animationAction.blendMode = loopAnimationComponent.blendMode.value
    }, [
      loopAnimationComponent._action,
      loopAnimationComponent.blendMode,
      loopAnimationComponent.loop,
      loopAnimationComponent.clampWhenFinished,
      loopAnimationComponent.zeroSlopeAtStart,
      loopAnimationComponent.zeroSlopeAtEnd
    ])

    useEffect(() => {
      if (!animationAction) return
      animationAction.setEffectiveWeight(loopAnimationComponent.weight.value)
      animationAction.setEffectiveTimeScale(loopAnimationComponent.timeScale.value)
    }, [loopAnimationComponent._action, loopAnimationComponent.weight, loopAnimationComponent.timeScale])

    /**
     * Callback functions
     */
    useEffect(() => {
      if (hasComponent(entity, CallbackComponent)) return
      const play = () => {
        loopAnimationComponent.paused.set(false)
      }
      const pause = () => {
        loopAnimationComponent.paused.set(true)
      }
      setCallback(entity, StandardCallbacks.PLAY, play)
      setCallback(entity, StandardCallbacks.PAUSE, pause)
    }, [])

    /**
     * A model is required for LoopAnimationComponent.
     */
    useEffect(() => {
      const asset = modelComponent?.asset.get(NO_PROXY) ?? null
      if (!asset?.scene) return
      const model = getComponent(entity, ModelComponent)
    }, [modelComponent?.asset])

    const [gltf] = useGLTF(loopAnimationComponent.animationPack.value, entity)

    useEffect(() => {
      const asset = modelComponent?.asset.get(NO_PROXY) ?? null
      if (
        !gltf ||
        !animComponent ||
        !asset?.scene ||
        !loopAnimationComponent.animationPack.value ||
        lastAnimationPack.value === loopAnimationComponent.animationPack.value
      )
        return

      animComponent.mixer.time.set(0)
      animComponent.mixer.value.stopAllAction()
      const animations = gltf.animations
      for (let i = 0; i < animations.length; i++) retargetAnimationClip(animations[i], gltf.scene)
      lastAnimationPack.set(loopAnimationComponent.animationPack.get(NO_PROXY))
      animComponent.animations.set(animations)
    }, [gltf, animComponent, modelComponent?.asset])

    return null
  }
})
