
import { clamp } from 'lodash'
import { AnimationAction, AnimationClip, AnimationMixer, LoopOnce, LoopRepeat, Object3D, Vector3 } from 'three'

import { UUIDComponent } from '@xrengine/ecs'
import { getComponent, getMutableComponent, hasComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { ECSState } from '@xrengine/ecs/src/ECSState'
import { Entity } from '@xrengine/ecs/src/Entity'
import { defineActionQueue, getState } from '@xrengine/hyperflux'
import { lerp } from '@xrengine/spatial/src/common/functions/MathLerpFunctions'

import { AnimationState } from '../AnimationManager'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { bindAnimationClipFromMixamo } from '../functions/retargetMixamoRig'
import { AvatarNetworkAction } from '../state/AvatarNetworkActions'
import { preloadedAnimations } from './Util'

/** @todo replace this with event sourcing */
const animationQueue = defineActionQueue(AvatarNetworkAction.setAnimationState.matches)

export const getAnimationAction = (name: string, mixer: AnimationMixer, animations?: AnimationClip[]) => {
  const manager = getState(AnimationState)
  const clip = AnimationClip.findByName(
    animations ?? manager.loadedAnimations[preloadedAnimations.locomotion]!.animations,
    name
  )
  return mixer.clipAction(clip)
}

const currentActionBlendSpeed = 7
const epsilon = 0.01

//blend between locomotion and animation clips
export const updateAnimationGraph = (avatarEntities: Entity[]) => {
  for (const newAnimation of animationQueue()) {
    const targetEntity = UUIDComponent.getEntityByUUID(newAnimation.entityUUID)
    if (!hasComponent(targetEntity, AvatarAnimationComponent)) {
      console.warn(
        '[updateAnimationGraph]: AvatarAnimationComponent not found on entity',
        targetEntity,
        newAnimation.entityUUID
      )
      continue
    }
    const animationState = getState(AnimationState)
    const animationAsset = animationState.loadedAnimations[newAnimation.animationAsset]
    if (!animationAsset) {
      console.warn(
        '[updateAnimationGraph]: Animation asset not loaded',
        newAnimation.animationAsset,
        newAnimation.entityUUID
      )
      continue
    }
    const graph = getMutableComponent(targetEntity, AvatarAnimationComponent).animationGraph
    graph.fadingOut.set(newAnimation.needsSkip ?? false)
    graph.layer.set(newAnimation.layer ?? 0)
    playAvatarAnimationFromMixamo(targetEntity, animationAsset.scene, newAnimation.loop!, newAnimation.clipName!)
  }

  for (const entity of avatarEntities) {
    const animationGraph = getMutableComponent(entity, AvatarAnimationComponent).animationGraph

    setAvatarLocomotionAnimation(entity)

    const currentAction = animationGraph.blendAnimation

    if (currentAction.value) {
      const deltaSeconds = getState(ECSState).deltaSeconds
      const locomotionBlend = animationGraph.blendStrength
      currentAction.value.setEffectiveWeight(locomotionBlend.value)
      if (
        (currentAction.value.time >= currentAction.value.getClip().duration - epsilon &&
          currentAction.value.loop != LoopRepeat) ||
        animationGraph.fadingOut.value
      ) {
        currentAction.value.setEffectiveTimeScale(0)
        locomotionBlend.set(Math.max(locomotionBlend.value - deltaSeconds * currentActionBlendSpeed, 0))
        if (locomotionBlend.value <= 0) {
          currentAction.value.setEffectiveWeight(0)
          animationGraph.fadingOut.set(false)
          currentAction.set(undefined)
        }
      } else {
        locomotionBlend.set(Math.min(locomotionBlend.value + deltaSeconds * currentActionBlendSpeed, 1))
      }
    }
  }
}

/** Retargets a mixamo animation to the entity's avatar model, then blends in and out of the default locomotion state. */
export const playAvatarAnimationFromMixamo = (
  entity: Entity,
  animationsScene: Object3D,
  loop?: boolean,
  clipName?: string
) => {
  const animationComponent = getComponent(entity, AnimationComponent)
  const avatarAnimationComponent = getMutableComponent(entity, AvatarAnimationComponent)
  const rigComponent = getComponent(entity, AvatarRigComponent)
  if (!rigComponent || !rigComponent.vrm) return
  //if animation is already present on animation component, use it instead of retargeting again
  let retargetedAnimation = animationComponent.animations.find(
    (clip) => clip.name == (clipName ?? animationsScene.animations[0].name)
  )
  //otherwise retarget and push to animation component's animations
  if (!retargetedAnimation) {
    retargetedAnimation = bindAnimationClipFromMixamo(
      clipName
        ? animationsScene.animations.find((clip) => clip.name == clipName) ?? animationsScene.animations[0]
        : animationsScene.animations[0],
      rigComponent.vrm
    )
    animationComponent.animations.push(retargetedAnimation)
  }
  const currentAction = avatarAnimationComponent.animationGraph.blendAnimation
  //before setting animation, stop previous animation if it exists
  if (currentAction.value) currentAction.value.stop()
  //set the animation to the current action
  currentAction.set(
    getAnimationAction(retargetedAnimation.name, animationComponent.mixer, animationComponent.animations)
  )
  if (currentAction.value) {
    const action = currentAction.value as AnimationAction
    action.timeScale = 1
    action.time = 0
    action.loop = loop ? LoopRepeat : LoopOnce
    action.play()
  }
}

const moveLength = new Vector3()
let runWeight = 0,
  walkWeight = 0,
  idleWeight = 1

export const setAvatarLocomotionAnimation = (entity: Entity) => {
  const animationComponent = getComponent(entity, AnimationComponent)
  if (!animationComponent.animations) return
  const avatarAnimationComponent = getMutableComponent(entity, AvatarAnimationComponent)

  const idle = getAnimationAction('Idle', animationComponent.mixer, animationComponent.animations)
  const run = getAnimationAction('Run', animationComponent.mixer, animationComponent.animations)
  const walk = getAnimationAction('Walk', animationComponent.mixer, animationComponent.animations)
  if (!idle || !run || !walk) return
  idle.play()
  run.play()
  walk.play()

  //for now we're hard coding layer overrides into the locomotion blending function
  const animationGraph = avatarAnimationComponent.animationGraph
  const idleBlendStrength = animationGraph.blendStrength.value
  const layerOverride = animationGraph.layer.value > 0
  const locomoteBlendStrength = layerOverride ? animationGraph.blendStrength.value : 0
  const needsSkip = animationGraph.fadingOut

  const magnitude = moveLength.copy(avatarAnimationComponent.value.locomotion).setY(0).lengthSq()
  if (animationGraph.blendAnimation && magnitude > 1 && idleBlendStrength >= 1 && !layerOverride) needsSkip.set(true)

  walkWeight = lerp(
    walk.getEffectiveWeight(),
    clamp(1 / (magnitude - 1.65) - locomoteBlendStrength, 0, 1),
    getState(ECSState).deltaSeconds * 4
  )
  runWeight = clamp(magnitude * 0.1 - walkWeight, 0, 1) - locomoteBlendStrength // - fallWeight
  idleWeight = clamp(1 - runWeight - walkWeight, 0, 1) // - fallWeight
  run.setEffectiveWeight(runWeight)
  walk.setEffectiveWeight(walkWeight)
  idle.setEffectiveWeight(idleWeight - idleBlendStrength)
}

export const getRootSpeed = (clip: AnimationClip) => {
  //calculate the speed of the root motion of the clip
  const tracks = clip.tracks
  const rootTrack = tracks[0]
  if (!rootTrack) return 0
  const startPos = new Vector3(rootTrack.values[0], rootTrack.values[1], rootTrack.values[2])
  const endPos = new Vector3(
    rootTrack.values[rootTrack.values.length - 3],
    rootTrack.values[rootTrack.values.length - 2],
    rootTrack.values[rootTrack.values.length - 1]
  )
  const speed = new Vector3().subVectors(endPos, startPos).length() / clip.duration
  return speed
}
