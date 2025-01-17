
import { FlowNode, IGraph, NodeCategory, NodeDescription, Socket } from '../../../VisualScriptModule'
import { ILogger, LogSeverity } from '../../ProfilesModule'

export class LogList extends FlowNode {
  public static Description = (logger: ILogger) =>
    new NodeDescription(
      'logic/list/log',
      NodeCategory.Logic,
      'Log',
      (description, graph) => new LogList(description, graph, logger)
    )

  constructor(
    description: NodeDescription,
    graph: IGraph,
    private readonly logger: ILogger
  ) {
    super(
      description,
      graph,
      [
        new Socket('flow', 'flow'),
        new Socket('string', 'text'),
        new Socket('string', 'severity', 'info'),
        new Socket('list', 'payload')
      ],
      [new Socket('flow', 'flow')]
    )
  }

  override triggered(fiber: any) {
    const text = this.readInput<string>('text')
    const payload = this.readInput<any>('payload')

    const message = `${text} ${JSON.stringify(payload)}`

    this.logger.log(this.readInput<LogSeverity>('severity'), message)

    fiber.commit(this, 'flow')
  }
}
