
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { HelmSettingQuery, HelmSettingType } from '@xrengine/common/src/schemas/setting/helm-setting.schema'
import { fromDateTimeSql, getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import type { HookContext } from '@xrengine/server-core/declarations'

export const helmSettingResolver = resolve<HelmSettingType, HookContext>({
  createdAt: virtual(async (helmSetting) => fromDateTimeSql(helmSetting.createdAt)),
  updatedAt: virtual(async (helmSetting) => fromDateTimeSql(helmSetting.updatedAt))
})

export const helmSettingExternalResolver = resolve<HelmSettingType, HookContext>({})

export const helmSettingDataResolver = resolve<HelmSettingType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const helmSettingPatchResolver = resolve<HelmSettingType, HookContext>({
  updatedAt: getDateTimeSql
})

export const helmSettingQueryResolver = resolve<HelmSettingQuery, HookContext>({})
