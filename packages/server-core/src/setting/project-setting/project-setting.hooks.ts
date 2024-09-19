
import { hooks as schemaHooks } from '@feathersjs/schema'
import setLoggedInUserInData from '@xrengine/server-core/src/hooks/set-loggedin-user-in-body'
import { iff, iffElse, isProvider } from 'feathers-hooks-common'

import {
  projectSettingDataValidator,
  projectSettingPatchValidator,
  projectSettingQueryValidator
} from '@xrengine/common/src/schemas/setting/project-setting.schema'

import verifyScope from '@xrengine/server-core/src/hooks/verify-scope'
import checkScope from '../../hooks/check-scope'
import setInContext from '../../hooks/set-in-context'
import verifyProjectPermission from '../../hooks/verify-project-permission'
import {
  projectSettingDataResolver,
  projectSettingExternalResolver,
  projectSettingPatchResolver,
  projectSettingQueryResolver,
  projectSettingResolver
} from './project-setting.resolvers'

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(projectSettingExternalResolver),
      schemaHooks.resolveResult(projectSettingResolver)
    ]
  },

  before: {
    all: [
      schemaHooks.validateQuery(projectSettingQueryValidator),
      schemaHooks.resolveQuery(projectSettingQueryResolver)
    ],
    find: [
      iff(
        isProvider('external'),
        iffElse(
          checkScope('projects', 'read'),
          [],
          [
            iffElse(
              checkScope('editor', 'write'),
              verifyProjectPermission(['owner', 'editor', 'reviewer']),
              setInContext('type', 'public')
            ) as any
          ]
        )
      )
    ],
    get: [],
    create: [
      setLoggedInUserInData('userId'),
      schemaHooks.validateData(projectSettingDataValidator),
      schemaHooks.resolveData(projectSettingDataResolver),
      iff(
        isProvider('external'),
        iffElse(
          checkScope('projects', 'write'),
          [],
          [verifyScope('editor', 'write'), verifyProjectPermission(['owner'])]
        )
      )
    ],
    patch: [
      setLoggedInUserInData('userId'),
      schemaHooks.validateData(projectSettingPatchValidator),
      schemaHooks.resolveData(projectSettingPatchResolver),
      iff(
        isProvider('external'),
        iffElse(
          checkScope('projects', 'write'),
          [],
          [verifyScope('editor', 'write'), verifyProjectPermission(['owner', 'editor'])]
        )
      )
    ],
    update: [],
    remove: [
      iff(
        isProvider('external'),
        iffElse(
          checkScope('projects', 'write'),
          [],
          [verifyScope('editor', 'write'), verifyProjectPermission(['owner'])]
        )
      )
    ]
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
