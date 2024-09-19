
import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  awsSettingDataValidator,
  awsSettingPatchValidator,
  awsSettingQueryValidator
} from '@xrengine/common/src/schemas/setting/aws-setting.schema'

import verifyScope from '../../hooks/verify-scope'
import {
  awsSettingDataResolver,
  awsSettingExternalResolver,
  awsSettingPatchResolver,
  awsSettingQueryResolver,
  awsSettingResolver
} from './aws-setting.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(awsSettingExternalResolver), schemaHooks.resolveResult(awsSettingResolver)]
  },

  before: {
    all: [
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      schemaHooks.validateQuery(awsSettingQueryValidator),
      schemaHooks.resolveQuery(awsSettingQueryResolver)
    ],
    find: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    get: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(awsSettingDataValidator),
      schemaHooks.resolveData(awsSettingDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('settings', 'write'))],
    patch: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(awsSettingPatchValidator),
      schemaHooks.resolveData(awsSettingPatchResolver)
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
