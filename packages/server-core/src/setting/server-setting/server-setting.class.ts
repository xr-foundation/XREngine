import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  ServerSettingData,
  ServerSettingPatch,
  ServerSettingQuery,
  ServerSettingType
} from '@xrengine/common/src/schemas/setting/server-setting.schema'

export interface ServerSettingParams extends KnexAdapterParams<ServerSettingQuery> {}

export class ServerSettingService<
  T = ServerSettingType,
  ServiceParams extends Params = ServerSettingParams
> extends KnexService<ServerSettingType, ServerSettingData, ServerSettingParams, ServerSettingPatch> {}
