import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  emailSettingDataValidator,
  emailSettingPatchValidator,
  emailSettingQueryValidator
} from '@xrengine/common/src/schemas/setting/email-setting.schema'

import verifyScope from '../../hooks/verify-scope'
import {
  emailSettingDataResolver,
  emailSettingExternalResolver,
  emailSettingPatchResolver,
  emailSettingQueryResolver,
  emailSettingResolver
} from './email-setting.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(emailSettingExternalResolver), schemaHooks.resolveResult(emailSettingResolver)]
  },

  before: {
    all: [
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      schemaHooks.validateQuery(emailSettingQueryValidator),
      schemaHooks.resolveQuery(emailSettingQueryResolver)
    ],
    find: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    get: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(emailSettingDataValidator),
      schemaHooks.resolveData(emailSettingDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('settings', 'write'))],
    patch: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(emailSettingPatchValidator),
      schemaHooks.resolveData(emailSettingPatchResolver)
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
