import { Application, HookContext } from '@feathersjs/feathers/lib/declarations'
import appConfig from '@xrengine/server-core/src/appconfig'
import { disallow } from 'feathers-hooks-common'
import { sign } from 'jsonwebtoken'

const getZendeskToken = (context: HookContext<Application>) => {
  const { email } = context.params.user.identityProviders.find((ip) => ip.email)

  context.result = sign(
    {
      scope: 'user',
      external_id: context.params.user.id,
      name: context.params.user.name,
      email
    },
    appConfig.zendesk.secret!,
    {
      header: {
        alg: 'HS256',
        kid: appConfig.zendesk.kid
      }
    }
  )
  return context
}

export default {
  before: {
    all: [],
    find: [disallow()],
    get: [disallow()],
    create: [getZendeskToken],
    update: [disallow()],
    patch: [disallow()],
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
