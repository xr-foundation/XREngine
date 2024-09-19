
import { Paginated } from '@feathersjs/feathers'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { discardQuery, iff, isProvider } from 'feathers-hooks-common'
import { Knex } from 'knex'

import {
  analyticsDataValidator,
  analyticsPatchValidator,
  analyticsQueryValidator,
  AnalyticsType
} from '@xrengine/common/src/schemas/analytics/analytics.schema'
import { instanceAttendancePath } from '@xrengine/common/src/schemas/networking/instance-attendance.schema'
import { userPath } from '@xrengine/common/src/schemas/user/user.schema'

import { HookContext } from '../../../declarations'
import isAction from '../../hooks/is-action'
import verifyScope from '../../hooks/verify-scope'
import { AnalyticsService } from './analytics.class'
import {
  analyticsDataResolver,
  analyticsExternalResolver,
  analyticsPatchResolver,
  analyticsQueryResolver,
  analyticsResolver
} from './analytics.resolvers'

async function addDailyUsers(context: HookContext<AnalyticsService>) {
  const limit = context.params.query?.$limit || 30
  const result: Paginated<AnalyticsType> = {
    total: limit,
    skip: 0,
    limit,
    data: []
  }

  const currentDate = new Date()
  for (let day = 0; day < limit; day++) {
    const knexClient: Knex = context.app.get('knexClient')

    const instanceAttendance = await knexClient
      .countDistinct('userId AS count')
      .table(instanceAttendancePath)
      .where('createdAt', '>', new Date(new Date().setDate(currentDate.getDate() - (day + 1))).toISOString())
      .andWhere('createdAt', '<=', new Date(new Date().setDate(currentDate.getDate() - day)).toISOString())
      .first()

    result.data.push({
      id: '',
      count: instanceAttendance.count,
      type: '',
      createdAt: new Date(new Date().setDate(currentDate.getDate() - day)).toDateString(),
      updatedAt: new Date(new Date().setDate(currentDate.getDate() - day)).toDateString()
    })
  }
  context.result = result
}

async function addDailyNewUsers(context: HookContext<AnalyticsService>) {
  const limit = context.params.query?.$limit || 30
  const result: Paginated<AnalyticsType> = {
    total: limit,
    skip: 0,
    limit,
    data: []
  }
  const currentDate = new Date()
  for (let day = 0; day < limit; day++) {
    const knexClient: Knex = this.app.get('knexClient')
    const newUsers = await knexClient
      .count('id AS count')
      .table(userPath)
      .where('createdAt', '>', new Date(new Date().setDate(currentDate.getDate() - (day + 1))).toISOString())
      .andWhere('createdAt', '<=', new Date(new Date().setDate(currentDate.getDate() - day)).toISOString())
      .first()

    result.data.push({
      id: '',
      count: newUsers.count,
      type: '',
      createdAt: new Date(new Date().setDate(currentDate.getDate() - day)).toDateString(),
      updatedAt: new Date(new Date().setDate(currentDate.getDate() - day)).toDateString()
    })
  }
  context.result = result
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(analyticsExternalResolver), schemaHooks.resolveResult(analyticsResolver)]
  },

  before: {
    all: [
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      schemaHooks.validateQuery(analyticsQueryValidator),
      schemaHooks.resolveQuery(analyticsQueryResolver)
    ],
    find: [
      iff(isAction('dailyUsers'), addDailyUsers),
      iff(isAction('dailyNewUsers'), addDailyNewUsers),
      discardQuery('action')
    ],
    get: [],
    create: [schemaHooks.validateData(analyticsDataValidator), schemaHooks.resolveData(analyticsDataResolver)],
    update: [],
    patch: [schemaHooks.validateData(analyticsPatchValidator), schemaHooks.resolveData(analyticsPatchResolver)],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
