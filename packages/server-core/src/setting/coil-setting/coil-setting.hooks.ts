import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  coilSettingDataValidator,
  coilSettingPatchValidator,
  coilSettingQueryValidator
} from '@xrengine/common/src/schemas/setting/coil-setting.schema'

import verifyScope from '../../hooks/verify-scope'
import {
  coilSettingDataResolver,
  coilSettingExternalResolver,
  coilSettingPatchResolver,
  coilSettingQueryResolver,
  coilSettingResolver
} from './coil-setting.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(coilSettingExternalResolver), schemaHooks.resolveResult(coilSettingResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(coilSettingQueryValidator), schemaHooks.resolveQuery(coilSettingQueryResolver)],
    find: [],
    get: [],
    create: [
      iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'write')),
      schemaHooks.validateData(coilSettingDataValidator),
      schemaHooks.resolveData(coilSettingDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'write'))],
    patch: [
      iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'write')),
      schemaHooks.validateData(coilSettingPatchValidator),
      schemaHooks.resolveData(coilSettingPatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'write'))]
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
