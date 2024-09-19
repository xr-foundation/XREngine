
import { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  MessageData,
  MessagePatch,
  MessageQuery,
  MessageType
} from '@xrengine/common/src/schemas/social/message.schema'

export interface MessageParams extends KnexAdapterParams<MessageQuery> {}

export class MessageService<T = MessageType, ServiceParams extends Params = MessageParams> extends KnexService<
  MessageType,
  MessageData,
  MessageParams,
  MessagePatch
> {}
