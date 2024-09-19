import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import {
  locationBanDataValidator,
  locationBanPatchValidator,
  locationBanQueryValidator
} from '@xrengine/common/src/schemas/social/location-ban.schema'

import verifyLocationAdmin from '../../hooks/verify-location-admin'
import {
  locationBanDataResolver,
  locationBanExternalResolver,
  locationBanPatchResolver,
  locationBanQueryResolver,
  locationBanResolver
} from './location-ban.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(locationBanExternalResolver), schemaHooks.resolveResult(locationBanResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(locationBanQueryValidator), schemaHooks.resolveQuery(locationBanQueryResolver)],
    find: [],
    get: [],
    create: [
      iff(isProvider('external'), verifyLocationAdmin()),
      schemaHooks.validateData(locationBanDataValidator),
      schemaHooks.resolveData(locationBanDataResolver)
    ],
    update: [disallow()],
    patch: [
      disallow(),
      schemaHooks.validateData(locationBanPatchValidator),
      schemaHooks.resolveData(locationBanPatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyLocationAdmin())]
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
