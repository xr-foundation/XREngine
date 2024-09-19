
import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  chargebeeSettingDataValidator,
  chargebeeSettingPatchValidator,
  chargebeeSettingQueryValidator
} from '@xrengine/common/src/schemas/setting/chargebee-setting.schema'

import verifyScope from '../../hooks/verify-scope'
import {
  chargebeeSettingDataResolver,
  chargebeeSettingExternalResolver,
  chargebeeSettingPatchResolver,
  chargebeeSettingQueryResolver,
  chargebeeSettingResolver
} from './chargebee-setting.resolvers'

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(chargebeeSettingExternalResolver),
      schemaHooks.resolveResult(chargebeeSettingResolver)
    ]
  },

  before: {
    all: [
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      schemaHooks.validateQuery(chargebeeSettingQueryValidator),
      schemaHooks.resolveQuery(chargebeeSettingQueryResolver)
    ],
    find: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    get: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(chargebeeSettingDataValidator),
      schemaHooks.resolveData(chargebeeSettingDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('settings', 'write'))],
    patch: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(chargebeeSettingPatchValidator),
      schemaHooks.resolveData(chargebeeSettingPatchResolver)
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
