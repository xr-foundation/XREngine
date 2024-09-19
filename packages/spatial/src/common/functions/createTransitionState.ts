
import { MathUtils } from 'three'

import { ECSState } from '@xrengine/ecs/src/ECSState'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { useExecute } from '@xrengine/ecs/src/SystemFunctions'
import { AnimationSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { getState, NO_PROXY, useHookstate } from '@xrengine/hyperflux'

type TransitionType = 'IN' | 'OUT'

const TransitionTypeSchema = S.LiteralUnion(['IN', 'OUT'])

export const TransitionStateSchema = (init: ReturnType<typeof createTransitionState>) =>
  S.Object(
    {
      state: TransitionTypeSchema,
      alpha: S.Number(),
      setState: S.Func([TransitionTypeSchema], S.Void()),
      update: S.Func([S.Number(), S.Func([S.Number()], S.Void())], S.Void())
    },
    init,
    {
      default: () => ({}),
      $id: 'TransitionState'
    }
  )

export const createTransitionState = (transitionPeriodSeconds: number, initialState: TransitionType = 'OUT') => {
  let currentState = initialState
  let alpha = initialState === 'IN' ? 1 : 0
  let _lastAlpha = -1

  const setState = (state: TransitionType) => {
    currentState = state
  }

  const update = (delta: number, callback: (alpha: number) => void) => {
    if (alpha < 1 && currentState === 'IN') alpha += delta / transitionPeriodSeconds
    if (alpha > 0 && currentState === 'OUT') alpha -= delta / transitionPeriodSeconds

    if (alpha !== _lastAlpha) {
      alpha = MathUtils.clamp(alpha, 0, 1)
      callback(alpha)
      _lastAlpha = alpha
    }
  }

  return {
    get state() {
      return currentState
    },
    get alpha() {
      return alpha
    },
    setState,
    update
  }
}

export const useAnimationTransition = (
  transitionPeriodSeconds: number,
  initialState: TransitionType = 'OUT',
  onTransition: (alpha: number) => void
) => {
  const state = useHookstate(() => createTransitionState(transitionPeriodSeconds, initialState))

  useExecute(
    () => {
      const deltaSeconds = getState(ECSState).deltaSeconds
      state.get(NO_PROXY).update(deltaSeconds, onTransition)
    },
    { with: AnimationSystemGroup }
  )

  return (newState: TransitionType) => {
    state.get(NO_PROXY).setState(newState)
  }
}
