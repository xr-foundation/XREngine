import { BadRequest } from '@feathersjs/errors'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'
import moment from 'moment'

import {
  loginTokenDataValidator,
  loginTokenPatchValidator,
  loginTokenQueryValidator
} from '@xrengine/common/src/schemas/user/login-token.schema'
import { toDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'

import { HookContext } from '../../../declarations'
import { LoginTokenService } from './login-token.class'
import {
  loginTokenDataResolver,
  loginTokenExternalResolver,
  loginTokenPatchResolver,
  loginTokenQueryResolver,
  loginTokenResolver
} from './login-token.resolvers'

const checkIdentityProvider = (context: HookContext<LoginTokenService>) => {
  if (!context.params.user || context.params.user.isGuest)
    throw new BadRequest('This can only generate a login link for a non-guest user')
  const data = Array.isArray(context.data) ? context.data : [context.data]
  if (data.length === 0 || !data[0]) data[0] = {}
  data[0].identityProviderId = context.params.user.identityProviders[0].id
  data[0].expiresAt = toDateTimeSql(moment().utc().add(10, 'minutes').toDate())
  return context
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(loginTokenExternalResolver), schemaHooks.resolveResult(loginTokenResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(loginTokenQueryValidator), schemaHooks.resolveQuery(loginTokenQueryResolver)],
    find: [disallow('external')],
    get: [disallow('external')],
    create: [
      iff(isProvider('external'), checkIdentityProvider),
      schemaHooks.validateData(loginTokenDataValidator),
      schemaHooks.resolveData(loginTokenDataResolver)
    ],
    update: [disallow('external')],
    patch: [
      disallow('external'),
      schemaHooks.validateData(loginTokenPatchValidator),
      schemaHooks.resolveData(loginTokenPatchResolver)
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
