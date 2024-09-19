import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  serverSettingDataValidator,
  serverSettingPatchValidator,
  serverSettingQueryValidator
} from '@xrengine/common/src/schemas/setting/server-setting.schema'

import verifyScope from '../../hooks/verify-scope'
import {
  serverSettingDataResolver,
  serverSettingExternalResolver,
  serverSettingPatchResolver,
  serverSettingQueryResolver,
  serverSettingResolver
} from './server-setting.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(serverSettingExternalResolver), schemaHooks.resolveResult(serverSettingResolver)]
  },

  before: {
    all: [
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      schemaHooks.validateQuery(serverSettingQueryValidator),
      schemaHooks.resolveQuery(serverSettingQueryResolver)
    ],
    find: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    get: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(serverSettingDataValidator),
      schemaHooks.resolveData(serverSettingDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('settings', 'write'))],
    patch: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(serverSettingPatchValidator),
      schemaHooks.resolveData(serverSettingPatchResolver)
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
