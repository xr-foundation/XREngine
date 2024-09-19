import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import {
  metabaseSettingDataValidator,
  metabaseSettingPatchValidator,
  metabaseSettingQueryValidator
} from '@xrengine/common/src/schemas/integrations/metabase/metabase-setting.schema'
import verifyScope from '@xrengine/server-core/src/hooks/verify-scope'
import {
  metabaseSettingDataResolver,
  metabaseSettingExternalResolver,
  metabaseSettingPatchResolver,
  metabaseSettingQueryResolver,
  metabaseSettingResolver
} from './metabase-setting.resolvers'

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(metabaseSettingExternalResolver),
      schemaHooks.resolveResult(metabaseSettingResolver)
    ]
  },

  before: {
    all: [
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      schemaHooks.validateQuery(metabaseSettingQueryValidator),
      schemaHooks.resolveQuery(metabaseSettingQueryResolver)
    ],
    find: [iff(isProvider('external'), verifyScope('settings', 'read'))],
    get: [disallow('external')],
    create: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(metabaseSettingDataValidator),
      schemaHooks.resolveData(metabaseSettingDataResolver)
    ],
    update: [disallow('external')],
    patch: [
      iff(isProvider('external'), verifyScope('settings', 'write')),
      schemaHooks.validateData(metabaseSettingPatchValidator),
      schemaHooks.resolveData(metabaseSettingPatchResolver)
    ],
    remove: [disallow('external')]
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
