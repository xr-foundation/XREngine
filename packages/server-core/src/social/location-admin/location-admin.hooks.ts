import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import {
  locationAdminDataValidator,
  locationAdminPatchValidator,
  locationAdminQueryValidator
} from '@xrengine/common/src/schemas/social/location-admin.schema'
import attachOwnerIdInQuery from '@xrengine/server-core/src/hooks/set-loggedin-user-in-query'

import verifyScope from '../../hooks/verify-scope'
import {
  locationAdminDataResolver,
  locationAdminExternalResolver,
  locationAdminPatchResolver,
  locationAdminQueryResolver,
  locationAdminResolver
} from './location-admin.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(locationAdminExternalResolver), schemaHooks.resolveResult(locationAdminResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(locationAdminQueryValidator), schemaHooks.resolveQuery(locationAdminQueryResolver)],
    find: [iff(isProvider('external'), attachOwnerIdInQuery('userId'))],
    get: [disallow('external')],
    create: [
      iff(isProvider('external'), verifyScope('location', 'write')),
      schemaHooks.validateData(locationAdminDataValidator),
      schemaHooks.resolveData(locationAdminDataResolver)
    ],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), verifyScope('location', 'write')),
      schemaHooks.validateData(locationAdminPatchValidator),
      schemaHooks.resolveData(locationAdminPatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('location', 'write'))]
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
