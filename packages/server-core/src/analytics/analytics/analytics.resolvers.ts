// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { AnalyticsQuery, AnalyticsType } from '@xrengine/common/src/schemas/analytics/analytics.schema'
import { fromDateTimeSql, getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import type { HookContext } from '@xrengine/server-core/declarations'

export const analyticsResolver = resolve<AnalyticsType, HookContext>({
  createdAt: virtual(async (analytics) => fromDateTimeSql(analytics.createdAt)),
  updatedAt: virtual(async (analytics) => fromDateTimeSql(analytics.updatedAt))
})

export const analyticsExternalResolver = resolve<AnalyticsType, HookContext>({})

export const analyticsDataResolver = resolve<AnalyticsType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const analyticsPatchResolver = resolve<AnalyticsType, HookContext>({
  updatedAt: getDateTimeSql
})

export const analyticsQueryResolver = resolve<AnalyticsQuery, HookContext>({})
