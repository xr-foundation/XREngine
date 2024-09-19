
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import {
  MetabaseSettingQuery,
  MetabaseSettingType
} from '@xrengine/common/src/schemas/integrations/metabase/metabase-setting.schema'
import { fromDateTimeSql, getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import type { HookContext } from '@xrengine/server-core/declarations'

export const metabaseSettingResolver = resolve<MetabaseSettingType, HookContext>({
  createdAt: virtual(async (metabaseSetting) => fromDateTimeSql(metabaseSetting.createdAt)),
  updatedAt: virtual(async (metabaseSetting) => fromDateTimeSql(metabaseSetting.updatedAt))
})

export const metabaseSettingExternalResolver = resolve<MetabaseSettingType, HookContext>({})

export const metabaseSettingDataResolver = resolve<MetabaseSettingType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const metabaseSettingPatchResolver = resolve<MetabaseSettingType, HookContext>({
  updatedAt: getDateTimeSql
})

export const metabaseSettingQueryResolver = resolve<MetabaseSettingQuery, HookContext>({})
