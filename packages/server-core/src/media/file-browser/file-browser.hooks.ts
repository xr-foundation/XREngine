
import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'
import { SYNC } from 'feathers-sync'

import {
  fileBrowserPatchValidator,
  fileBrowserUpdateValidator
} from '@xrengine/common/src/schemas/media/file-browser.schema'

import verifyScope from '../../hooks/verify-scope'

export default {
  before: {
    all: [iff(isProvider('external'), verifyScope('editor', 'write'))],
    find: [],
    get: [],
    create: [
      (context) => {
        context[SYNC] = false
        return context
      }
    ],
    update: [schemaHooks.validateData(fileBrowserUpdateValidator)],
    patch: [
      (context) => {
        context[SYNC] = false
        return context
      },
      schemaHooks.validateData(fileBrowserPatchValidator)
    ],
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
