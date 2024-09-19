
import { Forbidden } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import { clientSettingPath } from '@xrengine/common/src/schemas/setting/client-setting.schema'
import {
  userSettingDataValidator,
  userSettingPatchValidator,
  userSettingPath,
  userSettingQueryValidator
} from '@xrengine/common/src/schemas/user/user-setting.schema'
import attachOwnerId from '@xrengine/server-core/src/hooks/set-loggedin-user-in-body'
import attachOwnerIdInQuery from '@xrengine/server-core/src/hooks/set-loggedin-user-in-query'

import {
  userSettingDataResolver,
  userSettingExternalResolver,
  userSettingPatchResolver,
  userSettingQueryResolver,
  userSettingResolver
} from './user-setting.resolvers'

const ensureUserSettingsOwner = () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, params, id } = context
    const user = params.user
    const userSettings = await app.service(userSettingPath).get(id!)
    if (user.id !== userSettings.userId) throw new Forbidden(`You are not the owner of those ${userSettingPath}`)
    return context
  }
}

const ensureUserThemeModes = () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, result } = context
    const clientSettings = await app.service(clientSettingPath).find()
    if (clientSettings && clientSettings.data.length > 0) {
      context.result = await app
        .service(userSettingPath)
        .patch(result.id, { themeModes: clientSettings.data[0].themeModes })
    }

    return context
  }
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(userSettingExternalResolver), schemaHooks.resolveResult(userSettingResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(userSettingQueryValidator), schemaHooks.resolveQuery(userSettingQueryResolver)],
    find: [iff(isProvider('external'), attachOwnerIdInQuery('userId'))],
    get: [iff(isProvider('external'), attachOwnerIdInQuery('userId'))],
    create: [
      iff(isProvider('external'), attachOwnerId('userId')),
      schemaHooks.validateData(userSettingDataValidator),
      schemaHooks.resolveData(userSettingDataResolver)
    ],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), ensureUserSettingsOwner()),
      schemaHooks.validateData(userSettingPatchValidator),
      schemaHooks.resolveData(userSettingPatchResolver)
    ],
    remove: [disallow('external')]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [ensureUserThemeModes()],
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
