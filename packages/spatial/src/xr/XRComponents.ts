import type { VRMHumanBoneName } from '@pixiv/three-vrm'
import { useEffect } from 'react'

import { Engine, UndefinedEntity } from '@xrengine/ecs'
import {
  defineComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { NO_PROXY, getState, useImmediateEffect } from '@xrengine/hyperflux'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { Types } from 'bitecs'
import { EntityTreeComponent } from '../transform/components/EntityTree'
import { TransformComponent } from '../transform/components/TransformComponent'
import { ReferenceSpace, XRState } from './XRState'

/** Maps each XR Joint to it's parent joint */
export const XRJointParentMap = {
  'thumb-metacarpal': 'wrist',
  'thumb-phalanx-proximal': 'thumb-metacarpal',
  'thumb-phalanx-distal': 'thumb-phalanx-proximal',
  'thumb-tip': 'thumb-phalanx-distal',
  'index-finger-metacarpal': 'wrist',
  'index-finger-phalanx-proximal': 'index-finger-metacarpal',
  'index-finger-phalanx-intermediate': 'index-finger-phalanx-proximal',
  'index-finger-phalanx-distal': 'index-finger-phalanx-intermediate',
  'index-finger-tip': 'index-finger-phalanx-distal',
  'middle-finger-metacarpal': 'wrist',
  'middle-finger-phalanx-proximal': 'middle-finger-metacarpal',
  'middle-finger-phalanx-intermediate': 'middle-finger-phalanx-proximal',
  'middle-finger-phalanx-distal': 'middle-finger-phalanx-intermediate',
  'middle-finger-tip': 'middle-finger-phalanx-distal',
  'ring-finger-metacarpal': 'wrist',
  'ring-finger-phalanx-proximal': 'ring-finger-metacarpal',
  'ring-finger-phalanx-intermediate': 'ring-finger-phalanx-proximal',
  'ring-finger-phalanx-distal': 'ring-finger-phalanx-intermediate',
  'ring-finger-tip': 'ring-finger-phalanx-distal',
  'pinky-finger-metacarpal': 'wrist',
  'pinky-finger-phalanx-proximal': 'pinky-finger-metacarpal',
  'pinky-finger-phalanx-intermediate': 'pinky-finger-phalanx-proximal',
  'pinky-finger-phalanx-distal': 'pinky-finger-phalanx-intermediate',
  'pinky-finger-tip': 'pinky-finger-phalanx-distal'
} as Record<XRHandJoint, XRHandJoint>

/** Maps each XR Joint to it's corresponding Avatar Bone */
export const XRJointAvatarBoneMap = {
  // wrist: '', // handled by IK target
  'thumb-metacarpal': 'ThumbMetacarpal',
  'thumb-phalanx-proximal': 'ThumbProxal',
  'thumb-phalanx-distal': 'ThumbDistal',
  // 'thumb-tip': '', // no tips needed for FK
  'index-finger-metacarpal': 'IndexMetacarpal',
  'index-finger-phalanx-proximal': 'IndexProximal',
  'index-finger-phalanx-intermediate': 'IndexIntermediate',
  'index-finger-phalanx-distal': 'IndexDistal',
  // 'index-finger-tip': '',
  'middle-finger-metacarpal': 'MiddleMetacarpal',
  'middle-finger-phalanx-proximal': 'MiddleProximal',
  'middle-finger-phalanx-intermediate': 'MiddleIntermediate',
  'middle-finger-phalanx-distal': 'MiddleDistal',
  // 'middle-finger-tip': '',
  'ring-finger-metacarpal': 'RingMetacarpal',
  'ring-finger-phalanx-proximal': 'RingProximal',
  'ring-finger-phalanx-intermediate': 'RingIntermediate',
  'ring-finger-phalanx-distal': 'RingDistal',
  // 'ring-finger-tip': '',
  'pinky-finger-metacarpal': 'LittleMetacarpal',
  'pinky-finger-phalanx-proximal': 'LittleProximal',
  'pinky-finger-phalanx-intermediate': 'LittleIntermediate',
  'pinky-finger-phalanx-distal': 'LittleDistal'
  // 'pinky-finger-tip': ''
} as Record<XRHandJoint, string> // BoneName without the handedness

export const VRMHandsToXRJointMap = {
  leftWrist: 'wrist',
  leftThumbMetacarpal: 'thumb-metacarpal',
  leftThumbProximal: 'thumb-phalanx-proximal',
  leftThumbIntermediate: 'thumb-phalanx-distal',
  leftThumbDistal: 'thumb-tip',
  leftIndexProximal: 'index-finger-phalanx-proximal',
  leftIndexIntermediate: 'index-finger-phalanx-intermediate',
  leftIndexDistal: 'index-finger-phalanx-distal',
  leftIndexTip: 'index-finger-tip',
  leftMiddleProximal: 'middle-finger-phalanx-proximal',
  leftMiddleIntermediate: 'middle-finger-phalanx-intermediate',
  leftMiddleDistal: 'middle-finger-phalanx-distal',
  leftMiddleTip: 'middle-finger-tip',
  leftRingProximal: 'ring-finger-phalanx-proximal',
  leftRingIntermediate: 'ring-finger-phalanx-intermediate',
  leftRingDistal: 'ring-finger-phalanx-distal',
  leftRingTip: 'ring-finger-tip',
  leftLittleProximal: 'pinky-finger-phalanx-proximal',
  leftLittleIntermediate: 'pinky-finger-phalanx-intermediate',
  leftLittleDistal: 'pinky-finger-phalanx-distal',
  leftLittleTip: 'pinky-finger-tip',
  rightWrist: 'wrist',
  rightThumbMetacarpal: 'thumb-metacarpal',
  rightThumbProximal: 'thumb-phalanx-proximal',
  rightThumbIntermediate: 'thumb-phalanx-distal',
  rightThumbDistal: 'thumb-tip',
  rightIndexProximal: 'index-finger-phalanx-proximal',
  rightIndexIntermediate: 'index-finger-phalanx-intermediate',
  rightIndexDistal: 'index-finger-phalanx-distal',
  rightIndexTip: 'index-finger-tip',
  rightMiddleProximal: 'middle-finger-phalanx-proximal',
  rightMiddleIntermediate: 'middle-finger-phalanx-intermediate',
  rightMiddleDistal: 'middle-finger-phalanx-distal',
  rightMiddleTip: 'middle-finger-tip',
  rightRingProximal: 'ring-finger-phalanx-proximal',
  rightRingIntermediate: 'ring-finger-phalanx-intermediate',
  rightRingDistal: 'ring-finger-phalanx-distal',
  rightRingTip: 'ring-finger-tip',
  rightLittleProximal: 'pinky-finger-phalanx-proximal',
  rightLittleIntermediate: 'pinky-finger-phalanx-intermediate',
  rightLittleDistal: 'pinky-finger-phalanx-distal',
  rightLittleTip: 'pinky-finger-tip'
} as Partial<Record<VRMHumanBoneName, XRHandJoint>>

export const XRJointBones = [
  'wrist',
  'thumb-metacarpal',
  'thumb-phalanx-proximal',
  'thumb-phalanx-distal',
  'thumb-tip',
  'index-finger-metacarpal',
  'index-finger-phalanx-proximal',
  'index-finger-phalanx-intermediate',
  'index-finger-phalanx-distal',
  'index-finger-tip',
  'middle-finger-metacarpal',
  'middle-finger-phalanx-proximal',
  'middle-finger-phalanx-intermediate',
  'middle-finger-phalanx-distal',
  'middle-finger-tip',
  'ring-finger-metacarpal',
  'ring-finger-phalanx-proximal',
  'ring-finger-phalanx-intermediate',
  'ring-finger-phalanx-distal',
  'ring-finger-tip',
  'pinky-finger-metacarpal',
  'pinky-finger-phalanx-proximal',
  'pinky-finger-phalanx-intermediate',
  'pinky-finger-phalanx-distal',
  'pinky-finger-tip'
] as XRHandJoint[]

export const XRHandJointToIndexMap = XRJointBones.reduce(
  (map, joint, index) => {
    map[joint] = index
    return map
  },
  {} as Record<XRHandJoint, number>
)

export const XRHandComponent = defineComponent({
  name: 'XRHandComponent'
})

const rotationsSchema = { rotations: [Types.f32, 4 * 19] as const }

export const XRLeftHandComponent = defineComponent({
  name: 'XRLeftHandComponent',
  schema: rotationsSchema,

  onInit: (initial) => {
    return {
      ...initial,
      hand: null! as XRHand
    }
  }
})

export const XRRightHandComponent = defineComponent({
  name: 'XRRightHandComponent',
  schema: rotationsSchema,

  onInit: (initial) => {
    return {
      ...initial,
      hand: null! as XRHand
    }
  }
})

export const XRHitTestComponent = defineComponent({
  name: 'XRHitTest',
  schema: S.Object({
    options: S.Type<XRTransientInputHitTestOptionsInit | XRHitTestOptionsInit>(),
    source: S.Type<XRHitTestSource>(),
    results: S.Array(S.Type<XRHitTestResult>())
  }),

  reactor: () => {
    const entity = useEntityContext()

    const hitTest = useOptionalComponent(entity, XRHitTestComponent)

    useEffect(() => {
      if (!hitTest) return

      const options = hitTest.options.value
      const xrState = getState(XRState)

      let active = true

      if ('space' in options) {
        xrState.session?.requestHitTestSource?.(options as XRHitTestOptionsInit)?.then((source) => {
          if (active) {
            hitTest.source.set(source)
            hitTest.results.set([])
          } else {
            source.cancel()
          }
        })
      } else {
        xrState.session
          ?.requestHitTestSourceForTransientInput?.(options as XRTransientInputHitTestOptionsInit)
          ?.then((source) => {
            if (active) {
              hitTest.source.set(source)
              hitTest.results.set([])
            } else {
              source.cancel()
            }
          })
      }

      return () => {
        active = false
        hitTest?.source?.value?.cancel?.()
      }
    }, [hitTest?.options])

    return null
  }
})

export const XRAnchorComponent = defineComponent({
  name: 'XRAnchor',
  schema: S.Object({
    anchor: S.Type<XRAnchor>()
  }),

  reactor: () => {
    const entity = useEntityContext()
    const xrAnchorComponent = useComponent(entity, XRAnchorComponent)

    useImmediateEffect(() => {
      const anchor = xrAnchorComponent.anchor.get(NO_PROXY)
      return () => {
        anchor?.delete()
      }
    }, [xrAnchorComponent.anchor])

    return null
  }
})

export const XRSpaceComponent = defineComponent({
  name: 'XRSpace',

  schema: S.Object({
    space: S.Type<XRSpace>(),
    baseSpace: S.Type<XRSpace>()
  }),

  reactor: () => {
    const entity = useEntityContext()
    const xrSpaceComponent = useComponent(entity, XRSpaceComponent)

    useImmediateEffect(() => {
      const baseSpace = xrSpaceComponent.baseSpace.value
      let parentEntity = UndefinedEntity
      switch (baseSpace) {
        case ReferenceSpace.localFloor:
          parentEntity = Engine.instance.localFloorEntity
          break
        case ReferenceSpace.viewer:
          parentEntity = Engine.instance.cameraEntity
          break
      }

      setComponent(entity, EntityTreeComponent, { parentEntity })
      setComponent(entity, TransformComponent)
    }, [])

    return null
  }
})
