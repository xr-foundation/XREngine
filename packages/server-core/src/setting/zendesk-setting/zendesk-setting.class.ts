
import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  ZendeskSettingData,
  ZendeskSettingPatch,
  ZendeskSettingQuery,
  ZendeskSettingType
} from '@xrengine/common/src/schemas/setting/zendesk-setting.schema'

export interface ZendeskSettingParams extends KnexAdapterParams<ZendeskSettingQuery> {}

export class ZendeskSettingService<
  T = ZendeskSettingType,
  ServiceParams extends Params = ZendeskSettingParams
> extends KnexService<ZendeskSettingType, ZendeskSettingData, ZendeskSettingParams, ZendeskSettingPatch> {}
