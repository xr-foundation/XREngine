// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { UserKickID, UserKickQuery, UserKickType } from '@xrengine/common/src/schemas/user/user-kick.schema'
import { fromDateTimeSql, getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import type { HookContext } from '@xrengine/server-core/declarations'

export const userKickResolver = resolve<UserKickType, HookContext>({
  duration: virtual(async (userKick) => fromDateTimeSql(userKick.duration)),
  createdAt: virtual(async (userKick) => fromDateTimeSql(userKick.createdAt)),
  updatedAt: virtual(async (userKick) => fromDateTimeSql(userKick.updatedAt))
})

export const userKickExternalResolver = resolve<UserKickType, HookContext>({})

export const userKickDataResolver = resolve<UserKickType, HookContext>({
  id: async () => {
    return uuidv4() as UserKickID
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const userKickPatchResolver = resolve<UserKickType, HookContext>({
  updatedAt: getDateTimeSql
})

export const userKickQueryResolver = resolve<UserKickQuery, HookContext>({})
