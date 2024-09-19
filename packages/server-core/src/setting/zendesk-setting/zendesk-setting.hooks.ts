import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  zendeskSettingDataValidator,
  zendeskSettingPatchValidator,
  zendeskSettingQueryValidator
} from '@xrengine/common/src/schemas/setting/zendesk-setting.schema'

import verifyScope from '../../hooks/verify-scope'
import {
  zendeskSettingDataResolver,
  zendeskSettingExternalResolver,
  zendeskSettingPatchResolver,
  zendeskSettingQueryResolver,
  zendeskSettingResolver
} from './zendesk-setting.resolvers'

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(zendeskSettingExternalResolver),
      schemaHooks.resolveResult(zendeskSettingResolver)
    ]
  },

  before: {
    all: [
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      schemaHooks.validateQuery(zendeskSettingQueryValidator),
      schemaHooks.resolveQuery(zendeskSettingQueryResolver)
    ],
    find: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    get: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(zendeskSettingDataValidator),
      schemaHooks.resolveData(zendeskSettingDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('settings', 'write'))],
    patch: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(zendeskSettingPatchValidator),
      schemaHooks.resolveData(zendeskSettingPatchResolver)
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
