import { CustomEvent } from '../Events/CustomEvent'
import { Metadata } from '../Metadata'
import { NodeConfiguration } from '../Nodes/Node'
import { Dependencies } from '../Nodes/NodeDefinitions'
import { INode } from '../Nodes/NodeInstance'
import { IRegistry } from '../Registry'
import { Socket } from '../Sockets/Socket'
import { ValueTypeMap } from '../Values/ValueTypeMap'
import { Variable } from '../Values/Variables/Variable'
import { Logger } from '../VisualScriptEngineModule'

// Purpose:
//  - stores the node graph

export interface IGraph {
  readonly variables: { [id: string]: Variable }
  readonly customEvents: { [id: string]: CustomEvent }
  readonly values: ValueTypeMap
  readonly getDependency: <T>(id: string) => T | undefined
}

export type GraphNodes = { [id: string]: INode }
export type GraphVariables = { [id: string]: Variable }
export type GraphCustomEvents = { [id: string]: CustomEvent }

export type GraphInstance = {
  name: string
  metadata: Metadata
  nodes: GraphNodes
  customEvents: GraphCustomEvents
  variables: GraphVariables
}

export const createNode = ({
  graph,
  registry,
  nodeTypeName,
  nodeConfiguration = {}
}: {
  graph: IGraph
  registry: IRegistry
  nodeTypeName: string
  nodeConfiguration?: NodeConfiguration
}) => {
  const nodeDefinition = registry.nodes[nodeTypeName] ? registry.nodes[nodeTypeName] : undefined
  if (nodeDefinition === undefined) {
    Logger.verbose('known nodes: ' + Object.keys(registry.nodes).join(', '))
    throw new Error(`no registered node descriptions with the typeName ${nodeTypeName}`)
  }

  const node = nodeDefinition.nodeFactory(graph, nodeConfiguration)
  node.inputs.forEach((socket: Socket) => {
    if (socket.valueTypeName !== 'flow' && socket.value === undefined) {
      socket.value = registry.values[socket.valueTypeName]?.creator()
    }
  })

  return node
}

export const makeGraphApi = ({
  variables = {},
  customEvents = {},
  values,
  dependencies = {}
}: {
  customEvents?: GraphCustomEvents
  variables?: GraphVariables
  values: ValueTypeMap
  dependencies: Dependencies
}): IGraph => ({
  variables,
  customEvents,
  values,
  getDependency: (id: string) => {
    const result = dependencies[id]
    if (!result)
      console.error(
        `Dependency not found ${id}.  Did you register it? Existing dependencies: ${Object.keys(dependencies)}`
      )
    return result
  }
})
