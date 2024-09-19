
import { VRM, VRMHumanBoneName, VRMHumanBones } from '@pixiv/three-vrm'
import { useEffect } from 'react'
import { AnimationAction, Group, Matrix4, SkeletonHelper } from 'three'

import {
  defineComponent,
  getComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { createEntity, entityExists, removeEntity, useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { getMutableState, useHookstate } from '@xrengine/hyperflux'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { addObjectToGroup } from '@xrengine/spatial/src/renderer/components/GroupComponent'
import { setObjectLayers } from '@xrengine/spatial/src/renderer/components/ObjectLayerComponent'
import { setVisibleComponent, VisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@xrengine/spatial/src/renderer/constants/ObjectLayers'
import { RendererState } from '@xrengine/spatial/src/renderer/RendererState'
import { ComputedTransformComponent } from '@xrengine/spatial/src/transform/components/ComputedTransformComponent'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { ModelComponent } from '../../scene/components/ModelComponent'
import { addError, removeError } from '../../scene/functions/ErrorFunctions'
import { preloadedAnimations } from '../animation/Util'
import { AnimationState } from '../AnimationManager'
import {
  retargetAvatarAnimations,
  setAvatarSpeedFromRootMotion,
  setupAvatarForUser,
  setupAvatarProportions
} from '../functions/avatarFunctions'
import { AvatarPendingComponent } from './AvatarPendingComponent'

export const AvatarAnimationComponent = defineComponent({
  name: 'AvatarAnimationComponent',

  schema: S.Object({
    animationGraph: S.Object({
      blendAnimation: S.Optional(S.Type<AnimationAction>()),
      fadingOut: S.Bool(false),
      blendStrength: S.Number(0),
      layer: S.Number(0)
    }),
    /** ratio between original and target skeleton's root.position.y */
    rootYRatio: S.Number(1),
    /** The input vector for 2D locomotion blending space */
    locomotion: S.Vec3(),
    /** Time since the last update */
    deltaAccumulator: S.Number(0),
    /** Tells us if we are suspended in midair */
    isGrounded: S.Bool(true)
  })
})

export type Matrices = { local: Matrix4; world: Matrix4 }
export const AvatarRigComponent = defineComponent({
  name: 'AvatarRigComponent',

  schema: S.Object({
    /** rig bones with quaternions relative to the raw bones in their bind pose */
    normalizedRig: S.Type<VRMHumanBones>(),
    /** contains the raw bone quaternions */
    rawRig: S.Type<VRMHumanBones>(),
    /** contains ik solve data */
    ikMatrices: S.Record(
      S.LiteralUnion(Object.values(VRMHumanBoneName)),
      S.Object({
        local: S.Mat4(),
        world: S.Mat4()
      }),
      {}
    ),
    /** The VRM model */
    vrm: S.Type<VRM>(),
    avatarURL: S.Nullable(S.String())
  }),

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).avatarDebug)
    const rigComponent = useComponent(entity, AvatarRigComponent)
    const pending = useOptionalComponent(entity, AvatarPendingComponent)
    const visible = useOptionalComponent(entity, VisibleComponent)
    const modelComponent = useOptionalComponent(entity, ModelComponent)
    const locomotionAnimationState = useHookstate(
      getMutableState(AnimationState).loadedAnimations[preloadedAnimations.locomotion]
    )

    useEffect(() => {
      if (!visible?.value || !debugEnabled.value || pending?.value || !rigComponent.value.normalizedRig?.hips?.node)
        return

      const helper = new SkeletonHelper(rigComponent.value.vrm.scene as Group)
      helper.frustumCulled = false
      helper.name = `target-rig-helper-${entity}`

      const helperEntity = createEntity()
      setVisibleComponent(helperEntity, true)
      addObjectToGroup(helperEntity, helper)
      setComponent(helperEntity, NameComponent, helper.name)
      setObjectLayers(helper, ObjectLayers.AvatarHelper)

      setComponent(helperEntity, ComputedTransformComponent, {
        referenceEntities: [entity],
        computeFunction: () => {
          // this updates the bone helper lines
          helper.updateMatrixWorld(true)
        }
      })

      return () => {
        removeEntity(helperEntity)
      }
    }, [visible, debugEnabled, pending, rigComponent.normalizedRig])

    useEffect(() => {
      if (!modelComponent?.asset?.value) return
      const model = getComponent(entity, ModelComponent)
      setupAvatarProportions(entity, model.asset as VRM)
      setComponent(entity, AvatarRigComponent, {
        vrm: model.asset as VRM,
        avatarURL: model.src
      })
      return () => {
        if (!entityExists(entity)) return
        setComponent(entity, AvatarRigComponent, {
          vrm: null!,
          avatarURL: null
        })
      }
    }, [modelComponent?.asset])

    useEffect(() => {
      if (
        !rigComponent.value ||
        !rigComponent.value.vrm ||
        !rigComponent.value.avatarURL ||
        !locomotionAnimationState?.value
      )
        return
      const rig = getComponent(entity, AvatarRigComponent)
      try {
        setupAvatarForUser(entity, rig.vrm)
        retargetAvatarAnimations(entity)
      } catch (e) {
        console.error('Failed to load avatar', e)
        addError(entity, AvatarRigComponent, 'UNSUPPORTED_AVATAR')
        return () => {
          removeError(entity, AvatarRigComponent, 'UNSUPPORTED_AVATAR')
        }
      }
    }, [rigComponent.vrm])

    useEffect(() => {
      if (!locomotionAnimationState?.value) return
      setAvatarSpeedFromRootMotion()
    }, [locomotionAnimationState])

    return null
  },

  errors: ['UNSUPPORTED_AVATAR']
})
