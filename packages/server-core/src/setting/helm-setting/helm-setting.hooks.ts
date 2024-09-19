
import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  helmSettingDataValidator,
  helmSettingPatchValidator,
  helmSettingQueryValidator
} from '@xrengine/common/src/schemas/setting/helm-setting.schema'

import verifyScope from '../../hooks/verify-scope'
import {
  helmSettingDataResolver,
  helmSettingExternalResolver,
  helmSettingPatchResolver,
  helmSettingQueryResolver,
  helmSettingResolver
} from './helm-setting.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(helmSettingExternalResolver), schemaHooks.resolveResult(helmSettingResolver)]
  },

  before: {
    all: [
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      schemaHooks.validateQuery(helmSettingQueryValidator),
      schemaHooks.resolveQuery(helmSettingQueryResolver)
    ],
    find: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    get: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(helmSettingDataValidator),
      schemaHooks.resolveData(helmSettingDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('settings', 'write'))],
    patch: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(helmSettingPatchValidator),
      schemaHooks.resolveData(helmSettingPatchResolver)
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
