import { Assert } from '../Diagnostics/Assert'
import { VisualScriptEngine } from '../Execution/VisualScriptEngine'
import { IGraph } from '../Graphs/Graph'
import { Socket } from '../Sockets/Socket'
import { Node, NodeConfiguration } from './Node'
import { IEventNodeDefinition, NodeCategory } from './NodeDefinitions'
import { IEventNode, INode, NodeType } from './NodeInstance'
import { NodeDescription } from './Registry/NodeDescription'

// no flow inputs, always evaluated on startup
export class EventNode extends Node<NodeType.Event> implements IEventNode {
  constructor(
    description: NodeDescription,
    graph: IGraph,
    inputs: Socket[] = [],
    outputs: Socket[] = [],
    configuration: NodeConfiguration = {}
  ) {
    super({
      ...description,
      description: {
        ...description,
        category: description.category as NodeCategory
      },
      inputs,
      outputs,
      graph,
      configuration,
      nodeType: NodeType.Event
    })
    // no input flow sockets allowed.
    Assert.mustBeTrue(!this.inputs.some((socket) => socket.valueTypeName === 'flow'))

    // must have at least one output flow socket
    Assert.mustBeTrue(this.outputs.some((socket) => socket.valueTypeName === 'flow'))
  }

  init(engine: VisualScriptEngine) {
    throw new Error('not implemented')
  }

  dispose(engine: VisualScriptEngine) {
    throw new Error('not implemented')
  }
}

export class EventNode2 extends EventNode {
  constructor(props: {
    description: NodeDescription
    graph: IGraph
    inputs?: Socket[]
    outputs?: Socket[]
    configuration?: NodeConfiguration
  }) {
    super(props.description, props.graph, props.inputs, props.outputs, props.configuration)
  }
}

export class EventNodeInstance<TEventNodeDef extends IEventNodeDefinition>
  extends Node<NodeType.Event>
  implements IEventNode
{
  private initInner: TEventNodeDef['init']
  private disposeInner: TEventNodeDef['dispose']
  private state: TEventNodeDef['initialState']
  private readonly outputSocketKeys: string[]

  constructor(nodeProps: Omit<INode, 'nodeType'> & Pick<TEventNodeDef, 'init' | 'dispose' | 'initialState'>) {
    super({ ...nodeProps, nodeType: NodeType.Event })
    this.initInner = nodeProps.init
    this.disposeInner = nodeProps.dispose
    this.state = nodeProps.initialState
    this.outputSocketKeys = nodeProps.outputs.map((s) => s.name)
  }

  init = (engine: VisualScriptEngine): any => {
    this.state = this.initInner({
      read: this.readInput,
      write: this.writeOutput,
      state: this.state,
      outputSocketKeys: this.outputSocketKeys,
      commit: (outFlowname, fiberCompletedListener) => {
        engine.commitToNewFiber(this, outFlowname, fiberCompletedListener)
        engine.executeAllSync(1)
      },
      configuration: this.configuration,
      graph: this.graph
    })
  }

  dispose(): void {
    this.disposeInner({
      state: this.state,
      graph: this.graph
    })
  }
}
