import { Paginated } from '@feathersjs/feathers'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, discardQuery, iff, iffElse, isProvider } from 'feathers-hooks-common'

import {
  inviteDataValidator,
  invitePatchValidator,
  inviteQueryValidator
} from '@xrengine/common/src/schemas/social/invite.schema'
import { IdentityProviderType, identityProviderPath } from '@xrengine/common/src/schemas/user/identity-provider.schema'
import { userRelationshipPath } from '@xrengine/common/src/schemas/user/user-relationship.schema'
import inviteRemoveAuthenticate from '@xrengine/server-core/src/hooks/invite-remove-authenticate'
import attachOwnerIdInBody from '@xrengine/server-core/src/hooks/set-loggedin-user-in-body'
import attachOwnerIdInQuery from '@xrengine/server-core/src/hooks/set-loggedin-user-in-query'

import { HookContext } from '../../../declarations'
import isAction from '../../hooks/is-action'
import { sendInvite } from '../../hooks/send-invite'
import verifyScope from '../../hooks/verify-scope'
import { InviteService } from './invite.class'
import {
  inviteDataResolver,
  inviteExternalResolver,
  invitePatchResolver,
  inviteQueryResolver,
  inviteResolver
} from './invite.resolvers'

async function handleInvitee(context: HookContext<InviteService>) {
  const identityProviders = (await context.app.service(identityProviderPath).find({
    query: {
      userId: context.params.user!.id
    }
  })) as Paginated<IdentityProviderType>
  const identityProviderTokens = identityProviders.data.map((provider) => provider.token)

  const inviteeQuery = [
    {
      inviteeId: context.params.user!.id
    },
    {
      token: {
        $in: identityProviderTokens
      }
    }
  ]

  const $or = context.params.query?.$or ? [...context.param.query.$or, ...inviteeQuery] : inviteeQuery

  context.params.query = {
    ...context.params.query,
    $or
  }
}

async function removeFriend(context: HookContext<InviteService>) {
  if (!context.id) return
  const invite = await context.service.get(context.id)
  if (invite.inviteType === 'friend' && invite.inviteeId && !context.params?.preventUserRelationshipRemoval) {
    const relatedUserId = invite.userId === context.params.user!.id ? invite.inviteeId : invite.userId
    await context.app.service(userRelationshipPath).remove(relatedUserId, context.params as any)
  }
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(inviteExternalResolver), schemaHooks.resolveResult(inviteResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(inviteQueryValidator), schemaHooks.resolveQuery(inviteQueryResolver)],
    find: [
      iffElse(
        (context) => !!context.params.query?.action,
        [iff(isAction('received'), handleInvitee), iff(isAction('sent'), attachOwnerIdInQuery('userId'))],
        [verifyScope('invite', 'read')]
      ),
      discardQuery('action')
    ],
    get: [iff(isProvider('external'), attachOwnerIdInQuery('userId'))],
    create: [
      attachOwnerIdInBody('userId'),
      schemaHooks.validateData(inviteDataValidator),
      schemaHooks.resolveData(inviteDataResolver)
    ],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), verifyScope('invite', 'write')),
      schemaHooks.validateData(invitePatchValidator),
      schemaHooks.resolveData(invitePatchResolver)
    ],
    remove: [iff(isProvider('external'), inviteRemoveAuthenticate(), removeFriend)]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [sendInvite],
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
