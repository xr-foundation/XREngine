// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { LocationBanQuery, LocationBanType } from '@xrengine/common/src/schemas/social/location-ban.schema'
import { fromDateTimeSql, getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import type { HookContext } from '@xrengine/server-core/declarations'

export const locationBanResolver = resolve<LocationBanType, HookContext>({
  createdAt: virtual(async (locationBan) => fromDateTimeSql(locationBan.createdAt)),
  updatedAt: virtual(async (locationBan) => fromDateTimeSql(locationBan.updatedAt))
})

export const locationBanExternalResolver = resolve<LocationBanType, HookContext>({})

export const locationBanDataResolver = resolve<LocationBanType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const locationBanPatchResolver = resolve<LocationBanType, HookContext>({
  updatedAt: getDateTimeSql
})

export const locationBanQueryResolver = resolve<LocationBanQuery, HookContext>({})
