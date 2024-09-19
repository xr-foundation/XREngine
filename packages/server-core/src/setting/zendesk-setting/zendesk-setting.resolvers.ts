
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { ZendeskSettingQuery, ZendeskSettingType } from '@xrengine/common/src/schemas/setting/zendesk-setting.schema'
import { fromDateTimeSql, getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import type { HookContext } from '@xrengine/server-core/declarations'

export const zendeskSettingResolver = resolve<ZendeskSettingType, HookContext>({
  createdAt: virtual(async (zendeskSetting) => fromDateTimeSql(zendeskSetting.createdAt)),
  updatedAt: virtual(async (zendeskSetting) => fromDateTimeSql(zendeskSetting.updatedAt))
})

export const zendeskSettingExternalResolver = resolve<ZendeskSettingType, HookContext>({})

export const zendeskSettingDataResolver = resolve<ZendeskSettingType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const zendeskSettingPatchResolver = resolve<ZendeskSettingType, HookContext>({
  updatedAt: getDateTimeSql
})

export const zendeskSettingQueryResolver = resolve<ZendeskSettingQuery, HookContext>({})
