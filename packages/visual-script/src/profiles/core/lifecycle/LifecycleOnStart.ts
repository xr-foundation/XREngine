
import { Assert, makeEventNodeDefinition, NodeCategory } from '../../../VisualScriptModule'
import { ILifecycleEventEmitter } from '../abstractions/ILifecycleEventEmitter'

type State = {
  onStartEvent?: (() => void) | undefined
}

const makeInitialState = (): State => ({
  onStartEvent: undefined
})

export const LifecycleOnStart = makeEventNodeDefinition({
  typeName: 'flow/lifecycle/onStart',
  label: 'On Start',
  category: NodeCategory.Flow,
  in: {},
  out: {
    flow: 'flow'
  },
  initialState: makeInitialState(),
  init: ({ state, commit, graph: { getDependency } }) => {
    Assert.mustBeTrue(state.onStartEvent === undefined)
    const onStartEvent = () => {
      commit('flow')
    }

    const lifecycleEventEmitter = getDependency<ILifecycleEventEmitter>('ILifecycleEventEmitter')

    lifecycleEventEmitter?.startEvent.addListener(onStartEvent)

    return {
      onStartEvent
    }
  },
  dispose: ({ state: { onStartEvent }, graph: { getDependency } }) => {
    Assert.mustBeTrue(onStartEvent !== undefined)

    const lifecycleEventEmitter = getDependency<ILifecycleEventEmitter>('ILifecycleEventEmitter')

    if (onStartEvent) lifecycleEventEmitter?.startEvent.removeListener(onStartEvent)

    return {}
  }
})
