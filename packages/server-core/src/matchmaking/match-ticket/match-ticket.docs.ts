import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  matchTicketDataSchema,
  matchTicketQuerySchema,
  matchTicketSchema
} from '@xrengine/matchmaking/src/match-ticket.schema'

export default createSwaggerServiceOptions({
  schemas: {
    matchTicketDataSchema,
    matchTicketQuerySchema,
    matchTicketSchema
  },
  docs: {
    description: 'Match ticket service description',
    securities: ['all']
  }
})
