
import { BadRequest, Forbidden } from '@feathersjs/errors'
import { Paginated } from '@feathersjs/feathers'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { INVITE_CODE_REGEX, USER_ID_REGEX } from '@xrengine/common/src/regex'
import {
  ProjectPermissionData,
  ProjectPermissionPatch,
  ProjectPermissionType,
  projectPermissionDataValidator,
  projectPermissionPatchValidator,
  projectPermissionPath,
  projectPermissionQueryValidator
} from '@xrengine/common/src/schemas/projects/project-permission.schema'
import { projectPath } from '@xrengine/common/src/schemas/projects/project.schema'
import { InviteCode, UserID, UserType, userPath } from '@xrengine/common/src/schemas/user/user.schema'
import { checkScope } from '@xrengine/common/src/utils/checkScope'
import setLoggedInUserData from '@xrengine/server-core/src/hooks/set-loggedin-user-in-body'
import { disallow, discardQuery, iff, iffElse, isProvider } from 'feathers-hooks-common'

import { projectHistoryPath } from '@xrengine/common/src/schema.type.module'
import { HookContext } from '../../../declarations'
import logger from '../../ServerLogger'
import checkScopeHook from '../../hooks/check-scope'
import enableClientPagination from '../../hooks/enable-client-pagination'
import resolveProjectId from '../../hooks/resolve-project-id'
import verifyProjectPermission from '../../hooks/verify-project-permission'
import { ProjectPermissionService } from './project-permission.class'
import {
  projectPermissionDataResolver,
  projectPermissionExternalResolver,
  projectPermissionPatchResolver,
  projectPermissionQueryResolver,
  projectPermissionResolver
} from './project-permission.resolvers'

/**
 * Updates the inviteCode and userId fields to match the correct types
 * @param context
 * @returns
 */
const ensureInviteCode = async (context: HookContext<ProjectPermissionService>) => {
  if (!context.data || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const data: ProjectPermissionData[] = Array.isArray(context.data) ? context.data : [context.data]

  if (data[0].inviteCode && USER_ID_REGEX.test(data[0].inviteCode)) {
    data[0].userId = data[0].inviteCode as string as UserID
    delete data[0].inviteCode
  }
  if (data[0].userId && INVITE_CODE_REGEX.test(data[0].userId)) {
    data[0].inviteCode = data[0].userId as string as InviteCode
    delete (data[0] as any).userId
  }
  context.data = data[0]
}

/**
 * Checks if the user already has permissions for the project
 * @param context
 * @returns
 */
const checkExistingPermissions = async (context: HookContext<ProjectPermissionService>) => {
  if (!context.data || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const data: ProjectPermissionData[] = Array.isArray(context.data) ? context.data : [context.data]

  const selfUser = context.params!.user!
  try {
    const searchParam = data[0].inviteCode
      ? {
          inviteCode: data[0].inviteCode
        }
      : {
          id: data[0].userId
        }
    const users = (await context.app.service(userPath).find({
      query: searchParam
    })) as Paginated<UserType>
    if (users.data.length === 0) throw new BadRequest('Invalid user ID and/or user invite code')
    const existing = (await context.app.service(projectPermissionPath).find({
      query: {
        projectId: data[0].projectId,
        userId: users.data[0].id
      }
    })) as Paginated<ProjectPermissionType>
    if (existing.total > 0) context.result = existing.data[0]
    const project = await context.app.service(projectPath).get(data[0].projectId!)

    if (!project) throw new BadRequest('Invalid project ID')
    const existingPermissionsCount = (await context.app.service(projectPermissionPath).find({
      query: {
        projectId: data[0].projectId
      },
      paginate: false
    })) as any as ProjectPermissionType[]
    delete data[0].inviteCode

    context.data = {
      ...context.data,
      userId: users.data[0].id,
      type:
        data[0].type === 'owner' ||
        existingPermissionsCount.length === 0 ||
        ((await checkScope(selfUser, 'projects', 'write')) && selfUser.id === users.data[0].id)
          ? 'owner'
          : data[0].type
    }
  } catch (err) {
    logger.error(err)
    throw err
  }
}

/**
 * Checks if the user has permissions for the project
 * If they have some sort of permission, then they can see everyone else's permissions.
 * If they do not, then it will add `userId: context.params.user.id` to the query, to prevent the user seeing
 * any permissions, as that will force there to be no matches.
 * @param context
 * @returns
 */
const checkPermissionStatus = async (context: HookContext<ProjectPermissionService>) => {
  if (context.params.query?.projectId) {
    const permissionStatus = (await context.service._find({
      query: {
        projectId: context.params.query.projectId,
        userId: context.params.user!.id,
        $limit: 1
      }
    })) as Paginated<ProjectPermissionType>
    if (permissionStatus.data.length > 0) return context
  }

  // If user does not have permission of querying project then we should force user's id in request
  // in order to restrict user from querying other user's permissions.
  context.params.query = { ...context.params.query, userId: context.params.user!.id }
}

/**
 * Checks if the user owns the project
 * @param context
 * @returns
 */
const ensureOwnership = async (context: HookContext<ProjectPermissionService>) => {
  const loggedInUser = context.params!.user!
  if (await checkScope(loggedInUser, 'projects', 'read')) return
  const result = (Array.isArray(context.result) ? context.result : [context.result]) as ProjectPermissionType[]
  if (result[0].userId !== loggedInUser.id) throw new Forbidden('You do not own this project-permission')
}

/**
 * Ensures that the type field is present in the patch data
 * @param context
 * @returns
 */
const ensureTypeInPatch = async (context: HookContext<ProjectPermissionService>) => {
  if (!context.data || context.method !== 'patch') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const data: ProjectPermissionPatch = context.data as ProjectPermissionPatch
  context.data = { type: data.type === 'owner' ? 'owner' : data.type } as ProjectPermissionData
}

/**
 * Makes a random user the owner of the project if there are no owners
 * @param context
 * @returns
 */
const makeRandomProjectOwner = async (context: HookContext<ProjectPermissionService>) => {
  const result = (Array.isArray(context.result) ? context.result : [context.result]) as ProjectPermissionType[]
  if (context.id && context.result) await context.service.makeRandomProjectOwnerIfNone(result[0].projectId)
}

/**
 * Gets project id from permission and sets it in query
 * @param context
 * @returns
 */
const resolvePermissionId = async (context: HookContext<ProjectPermissionService>) => {
  if (context.id && typeof context.id === 'string') {
    const project = (await context.app.service(projectPermissionPath).find({
      query: {
        id: context.id,
        $limit: 1
      }
    })) as Paginated<ProjectPermissionType>

    if (project.data.length === 0) throw new BadRequest('Invalid project-permission ID')

    const projectId = project.data[0].projectId

    context.params.query = { ...context.params.query, projectId }

    return context
  }
}

const addDeleteLog = async (context: HookContext<ProjectPermissionService>) => {
  try {
    const resource = context.result as ProjectPermissionType

    const givenTo = resource.userId
    const user = await context.app.service(userPath).get(givenTo)

    await context.app.service(projectHistoryPath).create({
      projectId: resource.projectId,
      userId: context.params.user?.id || null,
      action: 'PERMISSION_REMOVED',
      actionIdentifier: resource.id,
      actionIdentifierType: 'project-permission',
      actionDetail: JSON.stringify({
        userName: user.name,
        userId: givenTo,
        permissionType: resource.type
      })
    })
  } catch (error) {
    console.error('Error in adding delete log: ', error)
  }
}

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(projectPermissionExternalResolver),
      schemaHooks.resolveResult(projectPermissionResolver)
    ]
  },

  before: {
    all: [
      schemaHooks.validateQuery(projectPermissionQueryValidator),
      schemaHooks.resolveQuery(projectPermissionQueryResolver)
    ],
    find: [
      enableClientPagination(),
      resolveProjectId(),
      discardQuery('project'),
      iff(isProvider('external'), iffElse(checkScopeHook('projects', 'read'), [], checkPermissionStatus))
    ],
    get: [],
    create: [
      iff(
        isProvider('external'),
        iffElse(checkScopeHook('projects', 'write'), [], [resolvePermissionId, verifyProjectPermission(['owner'])])
      ),
      schemaHooks.validateData(projectPermissionDataValidator),
      schemaHooks.resolveData(projectPermissionDataResolver),
      setLoggedInUserData('createdBy'),
      ensureInviteCode,
      checkExistingPermissions
    ],
    update: [disallow()],
    patch: [
      iff(
        isProvider('external'),
        iffElse(checkScopeHook('projects', 'write'), [], [resolvePermissionId, verifyProjectPermission(['owner'])])
      ),
      schemaHooks.validateData(projectPermissionPatchValidator),
      schemaHooks.resolveData(projectPermissionPatchResolver),
      ensureTypeInPatch
    ],
    remove: [
      iff(
        isProvider('external'),
        iffElse(checkScopeHook('projects', 'write'), [], [resolvePermissionId, verifyProjectPermission(['owner'])])
      )
    ]
  },

  after: {
    all: [],
    find: [],
    get: [ensureOwnership],
    create: [],
    update: [],
    patch: [makeRandomProjectOwner],
    remove: [makeRandomProjectOwner, addDeleteLog]
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
