import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, iffElse, isProvider } from 'feathers-hooks-common'

import {
  userAvatarDataValidator,
  userAvatarPatchValidator,
  userAvatarQueryValidator
} from '@xrengine/common/src/schemas/user/user-avatar.schema'
import { checkScope } from '@xrengine/common/src/utils/checkScope'

import setLoggedinUserInQuery from '../../hooks/set-loggedin-user-in-query'
import {
  userAvatarDataResolver,
  userAvatarExternalResolver,
  userAvatarPatchResolver,
  userAvatarQueryResolver,
  userAvatarResolver
} from './user-avatar.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(userAvatarExternalResolver), schemaHooks.resolveResult(userAvatarResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(userAvatarQueryValidator), schemaHooks.resolveQuery(userAvatarQueryResolver)],
    find: [],
    get: [disallow('external')],
    create: [
      disallow('external'),
      schemaHooks.validateData(userAvatarDataValidator),
      schemaHooks.resolveData(userAvatarDataResolver)
    ],
    patch: [
      iff(
        isProvider('external'),
        iffElse(
          async (context) => await checkScope(context.params.user, 'user', 'write'),
          [],
          [setLoggedinUserInQuery('userId')]
        )
      ),
      schemaHooks.validateData(userAvatarPatchValidator),
      schemaHooks.resolveData(userAvatarPatchResolver)
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
