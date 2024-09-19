import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  mailchimpSettingDataValidator,
  mailchimpSettingPatchValidator,
  mailchimpSettingQueryValidator
} from '@xrengine/common/src/schemas/setting/mailchimp-setting.schema'

import verifyScope from '../../hooks/verify-scope'
import {
  mailchimpSettingDataResolver,
  mailchimpSettingExternalResolver,
  mailchimpSettingPatchResolver,
  mailchimpSettingQueryResolver,
  mailchimpSettingResolver
} from './mailchimp-setting.resolvers'

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(mailchimpSettingExternalResolver),
      schemaHooks.resolveResult(mailchimpSettingResolver)
    ]
  },

  before: {
    all: [
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      schemaHooks.validateQuery(mailchimpSettingQueryValidator),
      schemaHooks.resolveQuery(mailchimpSettingQueryResolver)
    ],
    find: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    get: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(mailchimpSettingDataValidator),
      schemaHooks.resolveData(mailchimpSettingDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('settings', 'write'))],
    patch: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(mailchimpSettingPatchValidator),
      schemaHooks.resolveData(mailchimpSettingPatchResolver)
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
