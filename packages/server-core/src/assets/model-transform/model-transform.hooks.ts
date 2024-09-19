
import verifyScope from '../../hooks/verify-scope'

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [verifyScope('editor', 'write')],
    update: [verifyScope('editor', 'write')],
    patch: [verifyScope('editor', 'write')],
    remove: [verifyScope('editor', 'write')]
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
