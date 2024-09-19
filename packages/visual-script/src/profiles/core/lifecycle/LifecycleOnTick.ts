
import { Assert, makeEventNodeDefinition, NodeCategory } from '../../../VisualScriptModule'
import { ILifecycleEventEmitter } from '../abstractions/ILifecycleEventEmitter'

type State = {
  onTickEvent?: (() => void) | undefined
}

const makeInitialState = (): State => ({
  onTickEvent: undefined
})

export const LifecycleOnTick = makeEventNodeDefinition({
  typeName: 'flow/lifecycle/onTick',
  label: 'On Tick',
  category: NodeCategory.Flow,
  in: {},
  out: {
    flow: 'flow',
    deltaSeconds: 'float'
  },
  initialState: makeInitialState(),
  init: ({ state, commit, write, graph: { getDependency } }) => {
    Assert.mustBeTrue(state.onTickEvent === undefined)
    let lastTickTime = Date.now()
    const onTickEvent = () => {
      const currentTime = Date.now()
      const deltaSeconds = (currentTime - lastTickTime) * 0.001
      write('deltaSeconds', deltaSeconds)
      commit('flow')
      lastTickTime = currentTime
    }

    const lifecycleEventEmitter = getDependency<ILifecycleEventEmitter>('ILifecycleEventEmitter')

    lifecycleEventEmitter?.tickEvent.addListener(onTickEvent)

    return {
      onTickEvent
    }
  },
  dispose: ({ state: { onTickEvent }, graph: { getDependency } }) => {
    Assert.mustBeTrue(onTickEvent !== undefined)

    const lifecycleEventEmitter = getDependency<ILifecycleEventEmitter>('ILifecycleEventEmitter')

    if (onTickEvent) lifecycleEventEmitter?.tickEvent.removeListener(onTickEvent)

    return {}
  }
})
