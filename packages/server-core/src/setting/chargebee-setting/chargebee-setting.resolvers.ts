
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import {
  ChargebeeSettingQuery,
  ChargebeeSettingType
} from '@xrengine/common/src/schemas/setting/chargebee-setting.schema'
import { fromDateTimeSql, getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import type { HookContext } from '@xrengine/server-core/declarations'

export const chargebeeSettingResolver = resolve<ChargebeeSettingType, HookContext>({
  createdAt: virtual(async (chargebeeSetting) => fromDateTimeSql(chargebeeSetting.createdAt)),
  updatedAt: virtual(async (chargebeeSetting) => fromDateTimeSql(chargebeeSetting.updatedAt))
})

export const chargebeeSettingExternalResolver = resolve<ChargebeeSettingType, HookContext>({})

export const chargebeeSettingDataResolver = resolve<ChargebeeSettingType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const chargebeeSettingPatchResolver = resolve<ChargebeeSettingType, HookContext>({
  updatedAt: getDateTimeSql
})

export const chargebeeSettingQueryResolver = resolve<ChargebeeSettingQuery, HookContext>({})
