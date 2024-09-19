import { disallow } from 'feathers-hooks-common'
import { SYNC } from 'feathers-sync'

import logRequest from '@xrengine/server-core/src/hooks/log-request'
import setLoggedInUser from '@xrengine/server-core/src/hooks/set-loggedin-user-in-body'

// Don't remove this comment. It's needed to format import lines nicely.

export default {
  before: {
    all: [logRequest()],
    find: [disallow()],
    get: [],
    create: [setLoggedInUser('userId')],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      (context) => {
        context[SYNC] = false
        return context
      }
    ],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [logRequest()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
