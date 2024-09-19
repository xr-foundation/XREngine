
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { CoilSettingQuery, CoilSettingType } from '@xrengine/common/src/schemas/setting/coil-setting.schema'
import { UserType } from '@xrengine/common/src/schemas/user/user.schema'
import { fromDateTimeSql, getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import type { HookContext } from '@xrengine/server-core/declarations'

export const coilSettingResolver = resolve<CoilSettingType, HookContext>({
  createdAt: virtual(async (coilSetting) => fromDateTimeSql(coilSetting.createdAt)),
  updatedAt: virtual(async (coilSetting) => fromDateTimeSql(coilSetting.updatedAt))
})

const resolveForAdmin = async (value: string | undefined, query: CoilSettingType, context: HookContext) => {
  const loggedInUser = context!.params.user as UserType
  if (!loggedInUser.scopes || !loggedInUser.scopes.find((scope) => scope.type === 'admin:admin')) {
    return undefined
  }
  return value
}

export const coilSettingExternalResolver = resolve<CoilSettingType, HookContext>({
  clientId: resolveForAdmin,
  clientSecret: resolveForAdmin
})

export const coilSettingDataResolver = resolve<CoilSettingType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const coilSettingPatchResolver = resolve<CoilSettingType, HookContext>({
  updatedAt: getDateTimeSql
})

export const coilSettingQueryResolver = resolve<CoilSettingQuery, HookContext>({})
