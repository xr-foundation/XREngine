
import { NodeCategory } from '../../Nodes/NodeDefinitions'
import { NodeConfigurationDescription } from '../../Nodes/Registry/NodeDescription'
import { IRegistry } from '../../Registry'
import { Choices } from '../../Sockets/Socket'
import { createNode, makeGraphApi } from '../Graph'
import { NodeConfigurationJSON, VariableJSON } from './GraphJSON'
import { ChoiceJSON, InputSocketSpecJSON, NodeSpecJSON, OutputSocketSpecJSON } from './NodeSpecJSON'
import { readVariablesJSON } from './readGraphFromJSON'

function toChoices(valueChoices: Choices | undefined): ChoiceJSON | undefined {
  return valueChoices?.map((choice) => {
    if (typeof choice === 'string') return { text: choice, value: choice }
    return choice
  })
}

// create JSON specs for a single node based on given configuration
export function writeNodeSpecToJSON(
  registry: IRegistry,
  nodeTypeName: string,
  configuration: NodeConfigurationJSON,
  variableJson?: VariableJSON[]
): NodeSpecJSON {
  const variables = readVariablesJSON(registry.values, variableJson ?? [])
  const graph = makeGraphApi({
    ...registry,
    customEvents: {},
    variables: variables
  })
  const node = createNode({
    graph,
    registry,
    nodeTypeName,
    nodeConfiguration: configuration
  })

  const nodeDefinition: any = registry.nodes[nodeTypeName]

  const nodeSpecJSON: NodeSpecJSON = {
    type: nodeTypeName,
    category: node.description.category as NodeCategory,
    label: node.description.label,
    inputs: [],
    outputs: [],
    configuration: []
  }
  if (nodeDefinition.configuration) {
    Object.entries(nodeDefinition.configuration as NodeConfigurationDescription).forEach(([configName, configSpec]) => {
      nodeSpecJSON.configuration.push({
        name: configName,
        valueType: configSpec.valueType,
        defaultValue: configSpec.defaultValue
      })
    })
  }

  node.inputs.forEach((inputSocket) => {
    const valueType = inputSocket.valueTypeName === 'flow' ? undefined : registry.values[inputSocket.valueTypeName]

    let defaultValue = inputSocket.value
    if (valueType !== undefined) {
      defaultValue = valueType.serialize(defaultValue)
    }
    if (defaultValue === undefined && valueType !== undefined) {
      defaultValue = valueType.serialize(valueType.creator())
    }
    const socketSpecJSON: InputSocketSpecJSON = {
      name: inputSocket.name,
      valueType: inputSocket.valueTypeName,
      defaultValue,
      choices: toChoices(inputSocket.valueChoices)
    }
    nodeSpecJSON.inputs.push(socketSpecJSON)
  })

  node.outputs.forEach((outputSocket) => {
    const socketSpecJSON: OutputSocketSpecJSON = {
      name: outputSocket.name,
      valueType: outputSocket.valueTypeName
    }
    nodeSpecJSON.outputs.push(socketSpecJSON)
  })

  Object.entries(node.description.configuration).forEach(([configName, configSpec]) => {
    nodeSpecJSON.configuration.push({
      name: configName,
      valueType: configSpec.valueType,
      defaultValue: configSpec.defaultValue
    })
  })
  return nodeSpecJSON
}

// create JSON specs for all nodes with empty configuration
export function writeDefaultNodeSpecsToJSON(registry: IRegistry): NodeSpecJSON[] {
  const nodeSpecsJSON: NodeSpecJSON[] = []

  Object.keys(registry.nodes).forEach((nodeTypeName) => {
    nodeSpecsJSON.push(writeNodeSpecToJSON(registry, nodeTypeName, {}))
  })

  return nodeSpecsJSON
}
