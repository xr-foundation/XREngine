// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { RedisSettingQuery, RedisSettingType } from '@xrengine/common/src/schemas/setting/redis-setting.schema'
import { fromDateTimeSql, getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import type { HookContext } from '@xrengine/server-core/declarations'

export const redisSettingResolver = resolve<RedisSettingType, HookContext>({
  createdAt: virtual(async (redisSetting) => fromDateTimeSql(redisSetting.createdAt)),
  updatedAt: virtual(async (redisSetting) => fromDateTimeSql(redisSetting.updatedAt))
})

export const redisSettingExternalResolver = resolve<RedisSettingType, HookContext>({})

export const redisSettingDataResolver = resolve<RedisSettingType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const redisSettingPatchResolver = resolve<RedisSettingType, HookContext>({
  updatedAt: getDateTimeSql
})

export const redisSettingQueryResolver = resolve<RedisSettingQuery, HookContext>({})
