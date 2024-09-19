
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { UserLoginQuery, UserLoginType } from '@xrengine/common/src/schemas/user/user-login.schema'
import { fromDateTimeSql, getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import type { HookContext } from '@xrengine/server-core/declarations'

export const userLoginResolver = resolve<UserLoginType, HookContext>({
  createdAt: virtual(async (userLogin) => fromDateTimeSql(userLogin.createdAt))
})

export const userLoginExternalResolver = resolve<UserLoginType, HookContext>({})

export const userLoginDataResolver = resolve<UserLoginType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql
})

export const userLoginPatchResolver = resolve<UserLoginType, HookContext>({})

export const userLoginQueryResolver = resolve<UserLoginQuery, HookContext>({})
