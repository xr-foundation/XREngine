
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'

import {
  MatchTicketAssignmentQuery,
  MatchTicketAssignmentType
} from '@xrengine/matchmaking/src/match-ticket-assignment.schema'
import type { HookContext } from '@xrengine/server-core/declarations'

export const matchTicketAssignmentResolver = resolve<MatchTicketAssignmentType, HookContext>({})

export const matchTicketAssignmentExternalResolver = resolve<MatchTicketAssignmentType, HookContext>({})

export const matchTicketAssignmentQueryResolver = resolve<MatchTicketAssignmentQuery, HookContext>({})
