
import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import {
  instanceAttendanceDataValidator,
  instanceAttendancePatchValidator,
  instanceAttendanceQueryValidator
} from '@xrengine/common/src/schemas/networking/instance-attendance.schema'

import verifyScope from '../../hooks/verify-scope'
import {
  instanceAttendanceDataResolver,
  instanceAttendanceExternalResolver,
  instanceAttendancePatchResolver,
  instanceAttendanceQueryResolver,
  instanceAttendanceResolver
} from './instance-attendance.resolvers'

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(instanceAttendanceExternalResolver),
      schemaHooks.resolveResult(instanceAttendanceResolver)
    ]
  },

  before: {
    all: [
      schemaHooks.validateQuery(instanceAttendanceQueryValidator),
      schemaHooks.resolveQuery(instanceAttendanceQueryResolver)
    ],
    find: [iff(isProvider('external'), verifyScope('instance', 'read'))],
    get: [iff(isProvider('external'), verifyScope('instance', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('instance', 'write')),
      schemaHooks.validateData(instanceAttendanceDataValidator),
      schemaHooks.resolveData(instanceAttendanceDataResolver)
    ],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), verifyScope('instance', 'write')),
      schemaHooks.validateData(instanceAttendancePatchValidator),
      schemaHooks.resolveData(instanceAttendancePatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('instance', 'write'))]
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
