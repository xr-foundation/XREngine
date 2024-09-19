import { useEffect } from 'react'

import { Engine } from '@xrengine/ecs/src/Engine'
import { defineSystem, destroySystem, SystemUUID } from '@xrengine/ecs/src/SystemFunctions'
import { InputSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { NO_PROXY, useHookstate } from '@xrengine/hyperflux'
import { makeEventNodeDefinition, makeFlowNodeDefinition, NodeCategory, NodeDefinition } from '@xrengine/visual-script'

import { EnginetoNodetype, getSocketType, NodetoEnginetype } from './commonHelper'

const skipState = [''] //visual script state is skipped since its a type of record we do want to skip it anyways

export function generateStateNodeSchema(state, withFlow = false) {
  const nodeschema = {}
  const schema = state.get(NO_PROXY)
  if (schema === null) {
    return nodeschema
  }
  if (schema === undefined) {
    return nodeschema
  }
  for (const [name, value] of Object.entries(schema)) {
    const socketValue = getSocketType(name, value)
    if (withFlow) nodeschema[`${name}Change`] = 'flow'
    if (socketValue) nodeschema[name] = socketValue
  }
  return nodeschema
}

export function registerStateSetters() {
  const setters: NodeDefinition[] = []
  const skipped: string[] = []
  for (const [stateName, state] of Object.entries(Engine.instance.store.stateMap)) {
    if (skipState.includes(stateName)) {
      skipped.push(stateName)
      continue
    }
    const inputsockets = generateStateNodeSchema(state)
    if (Object.keys(inputsockets).length === 0) {
      skipped.push(stateName)
      continue
    }
    const node = makeFlowNodeDefinition({
      typeName: `engine/state/${stateName}/set`,
      category: NodeCategory.Engine,
      label: `set ${stateName}`,
      in: {
        flow: 'flow',
        ...inputsockets
      },
      out: { flow: 'flow' },
      initialState: undefined,
      triggered: ({ read, write, commit }) => {
        //read from the read and set dict acccordingly
        const inputs = Object.entries(node.in).splice(1)
        for (const [input, type] of inputs) {
          state[input].set(NodetoEnginetype(read(input as any), type))
        }
        commit('flow')
      }
    })
    setters.push(node)
  }
  return setters
}

export function registerStateGetters() {
  const getters: NodeDefinition[] = []
  const skipped: string[] = []
  for (const [stateName, state] of Object.entries(Engine.instance.store.stateMap)) {
    if (skipState.includes(stateName)) {
      skipped.push(stateName)
      continue
    }
    const outputsockets = generateStateNodeSchema(state)
    if (Object.keys(outputsockets).length === 0) {
      skipped.push(stateName)
      continue
    }
    const node = makeFlowNodeDefinition({
      typeName: `engine/state/${stateName}/get`,
      category: NodeCategory.Engine,
      label: `get ${stateName}`,
      in: {
        flow: 'flow'
      },
      out: {
        flow: 'flow',
        ...outputsockets
      },
      initialState: undefined,
      triggered: ({ read, write, commit }) => {
        const outputs = Object.entries(node.out).splice(1)
        const props = state
        if (typeof props !== 'object') {
          write(outputs[outputs.length - 1][0] as any, EnginetoNodetype(props))
        } else {
          for (const [output, type] of outputs) {
            write(output as any, EnginetoNodetype(props[output].value))
          }
        }
        commit('flow')
      }
    })
    getters.push(node)
  }
  return getters
}

let useStateSystemCounter = 0
type State = {
  systemUUID: SystemUUID
}

const initialState = (): State => ({
  systemUUID: '' as SystemUUID
})

const useStateSystemUUID = `visual-script-use-`
export const getUseStateSystemUUID = (stateName) =>
  (useStateSystemUUID + `${stateName}` + useStateSystemCounter) as SystemUUID

export function registerStateListeners() {
  const getters: NodeDefinition[] = []
  const skipped: string[] = []
  for (const [stateName, state] of Object.entries(Engine.instance.store.stateMap)) {
    if (skipState.includes(stateName)) {
      skipped.push(stateName)
      continue
    }
    const outputsockets: any = generateStateNodeSchema(state, true)
    if (Object.keys(outputsockets).length === 0) {
      skipped.push(stateName)
      continue
    }
    const node = makeEventNodeDefinition({
      typeName: `engine/state/${stateName}/use`,
      category: NodeCategory.Engine,
      label: `Use ${stateName}`,
      in: {},
      out: {
        ...outputsockets
      },
      initialState: initialState(),
      init: ({ read, write, commit }) => {
        const valueOutputs = Object.entries(node.out).filter(([output, type]) => type !== 'flow') as any
        const flowOutputs = Object.entries(node.out).filter(([output, type]) => type === 'flow') as any
        useStateSystemCounter++
        console.log('stateName', getUseStateSystemUUID(stateName))
        const systemUUID = defineSystem({
          uuid: getUseStateSystemUUID(stateName),
          insert: { with: InputSystemGroup },
          execute: () => {},
          reactor: () => {
            const stateValue = useHookstate(state)
            if (typeof stateValue.value !== 'object') {
              useEffect(() => {
                const value = EnginetoNodetype(stateValue.value)
                write(valueOutputs[valueOutputs.length - 1][0] as any, value)
                commit(flowOutputs[flowOutputs.length - 1][0] as any)
              }, [stateValue])
            } else {
              valueOutputs.forEach(([output, type], index) => {
                useEffect(() => {
                  const value = EnginetoNodetype(stateValue[output].value)
                  const flowSocket = flowOutputs.find(([flowOutput, flowType]) => flowOutput === `${output}Change`)
                  write(output as any, value)
                  commit(flowSocket[0] as any)
                }, [stateValue[output]])
              })
            }
            return null
          }
        })

        const outputState: State = {
          systemUUID
        }

        return outputState
      },
      dispose: ({ state: { systemUUID } }) => {
        destroySystem(systemUUID)
        return initialState()
      }
    })
    getters.push(node)
  }
  return getters
}
