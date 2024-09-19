import { iff, isProvider } from 'feathers-hooks-common'

import verifyScope from '../../hooks/verify-scope'

export default {
  before: {
    all: [iff(isProvider('external'), verifyScope('benchmarking', 'write') as any)],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
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
