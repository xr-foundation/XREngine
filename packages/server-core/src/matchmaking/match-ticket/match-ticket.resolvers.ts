// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { fromDateTimeSql, getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import { MatchTicketQuery, MatchTicketType } from '@xrengine/matchmaking/src/match-ticket.schema'
import type { HookContext } from '@xrengine/server-core/declarations'

export const matchTicketResolver = resolve<MatchTicketType, HookContext>({
  createdAt: virtual(async (matchTicket) => (matchTicket.createdAt ? fromDateTimeSql(matchTicket.createdAt) : '')),
  updatedAt: virtual(async (matchTicket) => (matchTicket.updatedAt ? fromDateTimeSql(matchTicket.updatedAt) : ''))
})

export const matchTicketExternalResolver = resolve<MatchTicketType, HookContext>({})

export const matchTicketDataResolver = resolve<MatchTicketType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const matchTicketQueryResolver = resolve<MatchTicketQuery, HookContext>({})
