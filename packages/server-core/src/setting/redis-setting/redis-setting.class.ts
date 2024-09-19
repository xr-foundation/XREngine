
import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  RedisSettingData,
  RedisSettingPatch,
  RedisSettingQuery,
  RedisSettingType
} from '@xrengine/common/src/schemas/setting/redis-setting.schema'

export interface RedisSettingParams extends KnexAdapterParams<RedisSettingQuery> {}

export class RedisSettingService<
  T = RedisSettingType,
  ServiceParams extends Params = RedisSettingParams
> extends KnexService<RedisSettingType, RedisSettingData, RedisSettingParams, RedisSettingPatch> {}
