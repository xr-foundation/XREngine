
import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  ChargebeeSettingData,
  ChargebeeSettingPatch,
  ChargebeeSettingQuery,
  ChargebeeSettingType
} from '@xrengine/common/src/schemas/setting/chargebee-setting.schema'

export interface ChargebeeSettingParams extends KnexAdapterParams<ChargebeeSettingQuery> {}

export class ChargebeeSettingService<
  T = ChargebeeSettingType,
  ServiceParams extends Params = ChargebeeSettingParams
> extends KnexService<ChargebeeSettingType, ChargebeeSettingData, ChargebeeSettingParams, ChargebeeSettingPatch> {}
