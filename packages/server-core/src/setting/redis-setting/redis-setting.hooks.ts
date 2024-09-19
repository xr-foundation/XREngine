import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  redisSettingDataValidator,
  redisSettingPatchValidator,
  redisSettingQueryValidator
} from '@xrengine/common/src/schemas/setting/redis-setting.schema'

import verifyScope from '../../hooks/verify-scope'
import {
  redisSettingDataResolver,
  redisSettingExternalResolver,
  redisSettingPatchResolver,
  redisSettingQueryResolver,
  redisSettingResolver
} from './redis-setting.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(redisSettingExternalResolver), schemaHooks.resolveResult(redisSettingResolver)]
  },

  before: {
    all: [
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      schemaHooks.validateQuery(redisSettingQueryValidator),
      schemaHooks.resolveQuery(redisSettingQueryResolver)
    ],
    find: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    get: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(redisSettingDataValidator),
      schemaHooks.resolveData(redisSettingDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('settings', 'write'))],
    patch: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(redisSettingPatchValidator),
      schemaHooks.resolveData(redisSettingPatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('settings', 'write'))]
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
