
import { BadRequest } from '@feathersjs/errors'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import {
  UserRelationshipData,
  userRelationshipDataValidator,
  userRelationshipPatchValidator,
  userRelationshipPath,
  userRelationshipQueryValidator
} from '@xrengine/common/src/schemas/user/user-relationship.schema'
import { UserID, userPath } from '@xrengine/common/src/schemas/user/user.schema'
import setLoggedInUserInQuery from '@xrengine/server-core/src/hooks/set-loggedin-user-in-query'

import { HookContext } from '../../../declarations'
import disallowNonId from '../../hooks/disallow-non-id'
import setLoggedinUserInBody from '../../hooks/set-loggedin-user-in-body'
import verifyUserId from '../../hooks/verify-userId'
import { UserRelationshipService } from './user-relationship.class'
import {
  userRelationshipDataResolver,
  userRelationshipExternalResolver,
  userRelationshipPatchResolver,
  userRelationshipQueryResolver,
  userRelationshipResolver
} from './user-relationship.resolvers'

/**
 * Ensure id passed in request is a valid user id
 * @param context
 * @returns
 */
const ensureValidRemoveId = async (context: HookContext<UserRelationshipService>) => {
  if (context.method !== 'remove') {
    throw new BadRequest(`${context.path} service wrong hook in ${context.method}`)
  }

  const user = await context.app.service(userPath).get(context.id!)
  if (!user) {
    throw new BadRequest(`${context.path} service ${context.method} id should be user id`)
  }
}

/**
 * Update query such that user is removed from relationship both ways
 * @param context
 * @returns
 */
const updateQueryBothWays = async (context: HookContext<UserRelationshipService>) => {
  if (context.method !== 'remove') {
    throw new BadRequest(`${context.path} service wrong hook in ${context.method}`)
  }

  const userId = context.params.user!.id

  context.params.query = {
    $or: [
      {
        userId,
        relatedUserId: context.id! as UserID
      },
      {
        userId: context.id! as UserID,
        relatedUserId: userId
      }
    ]
  }

  context.arguments[0] = null
}

/**
 * Removes blocking relationship for the users
 * @param context
 * @returns
 */
const clearBlockingRelationships = async (context: HookContext<UserRelationshipService>) => {
  if (Array.isArray(context.data) || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for single object create`)
  }

  const { relatedUserId, userRelationshipType } = context.data as UserRelationshipData
  const user = context.params.user

  if (userRelationshipType === 'blocking') {
    await context.app.service(userRelationshipPath).remove(relatedUserId, { user })
  }
}

/**
 * Update data such that certain relationships are created both ways
 * @param context
 * @returns
 */
const updateDataBothWays = async (context: HookContext<UserRelationshipService>) => {
  if (Array.isArray(context.data) || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for single object create`)
  }

  const { userId, relatedUserId, userRelationshipType } = context.data as UserRelationshipData

  if (userRelationshipType === 'blocking' || userRelationshipType === 'requested') {
    context.data = [
      context.data!,
      {
        ...context.data!,
        userId: relatedUserId,
        relatedUserId: userId,
        userRelationshipType: userRelationshipType === 'blocking' ? 'blocked' : 'pending'
      }
    ]
  }
}

/**
 * Ensure id passed in request is a user id or relationship id and then updated
 * query params based on that.
 * @param context
 * @returns
 */
const ensureValidPatchId = async (context: HookContext<UserRelationshipService>) => {
  if (context.method !== 'patch') {
    throw new BadRequest(`${context.path} service wrong hook in ${context.method}`)
  }

  const userId = context.params.user!.id

  const user = await context.app.service(userPath).get(context.id!)

  //The ID resolves to a userId, in which case patch the relation joining that user to the requesting one
  if (user) {
    context.params.query = {
      userId,
      relatedUserId: context.id as UserID
    }

    context.arguments[0] = null
  }
}

/**
 * Update records such that after patch, certain relationships are created both ways
 * @param context
 * @returns
 */
const updatePatchBothWays = async (context: HookContext<UserRelationshipService>) => {
  if (Array.isArray(context.data) || context.method !== 'patch') {
    throw new BadRequest(`${context.path} service only works for single object patch`)
  }

  const { userId, relatedUserId, userRelationshipType } = context.result![0] as UserRelationshipData

  if (
    (context.result || context.dispatch) &&
    (userRelationshipType === 'friend' || userRelationshipType === 'blocking')
  ) {
    context.service._patch(
      null,
      {
        userRelationshipType: userRelationshipType === 'friend' ? 'friend' : 'blocked'
      },
      {
        query: {
          userId: relatedUserId,
          relatedUserId: userId
        }
      }
    )
  }
}

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(userRelationshipExternalResolver),
      schemaHooks.resolveResult(userRelationshipResolver)
    ]
  },

  before: {
    all: [
      schemaHooks.validateQuery(userRelationshipQueryValidator),
      schemaHooks.resolveQuery(userRelationshipQueryResolver)
    ],
    find: [iff(isProvider('external'), verifyUserId()), iff(isProvider('external'), setLoggedInUserInQuery('userId'))],
    get: [disallow()],
    create: [
      schemaHooks.validateData(userRelationshipDataValidator),
      setLoggedinUserInBody('userId'),
      clearBlockingRelationships,
      updateDataBothWays,
      // Calling resolver data later, such that the updated context.data in `updateDataBothWays` is resolved too
      schemaHooks.resolveData(userRelationshipDataResolver)
    ],
    update: [],
    patch: [
      schemaHooks.validateData(userRelationshipPatchValidator),
      schemaHooks.resolveData(userRelationshipPatchResolver),
      disallowNonId,
      setLoggedinUserInBody('userId'),
      ensureValidPatchId
    ],
    remove: [disallowNonId, ensureValidRemoveId, updateQueryBothWays]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [updatePatchBothWays],
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
