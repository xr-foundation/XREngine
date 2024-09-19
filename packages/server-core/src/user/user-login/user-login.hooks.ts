
import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  userLoginDataValidator,
  userLoginPatchValidator,
  userLoginQueryValidator
} from '@xrengine/common/src/schemas/user/user-login.schema'
import { disallow } from 'feathers-hooks-common'
import {
  userLoginDataResolver,
  userLoginExternalResolver,
  userLoginPatchResolver,
  userLoginQueryResolver,
  userLoginResolver
} from './user-login.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(userLoginExternalResolver), schemaHooks.resolveResult(userLoginResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(userLoginQueryValidator), schemaHooks.resolveQuery(userLoginQueryResolver)],
    find: [disallow('external')],
    get: [disallow()],
    create: [
      disallow('external'),
      schemaHooks.validateData(userLoginDataValidator),
      schemaHooks.resolveData(userLoginDataResolver)
    ],
    update: [disallow()],
    patch: [
      disallow(),
      schemaHooks.validateData(userLoginPatchValidator),
      schemaHooks.resolveData(userLoginPatchResolver)
    ],
    remove: [disallow()]
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
