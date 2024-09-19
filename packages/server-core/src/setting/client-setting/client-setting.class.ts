import { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  ClientSettingData,
  ClientSettingPatch,
  ClientSettingQuery,
  ClientSettingType
} from '@xrengine/common/src/schemas/setting/client-setting.schema'

export interface ClientSettingParams extends KnexAdapterParams<ClientSettingQuery> {}

/**
 * A class for ClientSetting service
 */

export class ClientSettingService<
  T = ClientSettingType,
  ServiceParams extends Params = ClientSettingParams
> extends KnexService<ClientSettingType, ClientSettingData, ClientSettingParams, ClientSettingPatch> {}
