import AbortController from 'abort-controller'
import axios from 'axios'
import fetch from 'node-fetch'

import { MatchTicketAssignmentType } from './match-ticket-assignment.schema'
import { MatchTicketType } from './match-ticket.schema'

export const FRONTEND_SERVICE_URL = process.env.FRONTEND_SERVICE_URL || 'http://localhost:51504/v1/frontendservice'
const axiosInstance = axios.create({
  baseURL: FRONTEND_SERVICE_URL
})

/**
 * @param response
 */
function checkForApiErrorResponse(response: unknown): unknown {
  if (!response) {
    return response
  }

  if ((response as any).code) {
    throw response
  } else if ((response as any).error) {
    throw (response as any).error
  }

  return response
}

function createTicket(gameMode: string, attributes?: Record<string, string>): Promise<MatchTicketType> {
  const searchFields: any = {
    tags: [gameMode],
    doubleArgs: {
      'time.enterqueue': Date.now()
    }
  }

  if (attributes) {
    searchFields.stringArgs = {}
    for (const attributesKey in attributes) {
      searchFields.stringArgs['attributes.' + attributesKey] = attributes[attributesKey]
    }
  }

  // console.log('TICKET.CREATE --------- searchFields', searchFields)

  return axiosInstance
    .post(`/tickets`, {
      ticket: {
        searchFields
      }
    })
    .then((r) => r.data)
    .then(checkForApiErrorResponse)
    .then((response) => response as MatchTicketType)
}

function readStreamFirstData(stream: NodeJS.ReadableStream) {
  return new Promise((resolve, reject) => {
    stream.once('readable', () => {
      const chunk = stream.read()
      resolve(JSON.parse(chunk.toString()))
    })
    stream.once('error', reject)
  })
}

// TicketAssignmentsResponse
async function getTicketsAssignment(ticketId: string, timeout = 300): Promise<MatchTicketAssignmentType> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeout)

  let data
  try {
    const response = await fetch(`${FRONTEND_SERVICE_URL}/tickets/${ticketId}/assignments`, {
      signal: controller.signal
    })

    data = await readStreamFirstData(response.body!)
  } catch (error) {
    if (error.name === 'AbortError') {
      // no assignment yet
      return {
        connection: ''
      }
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
  checkForApiErrorResponse(data)

  return data.result.assignment
}

function getTicket(ticketId: string): Promise<MatchTicketType | void> {
  return axiosInstance
    .get(`/tickets/${ticketId}`)
    .then((r) => r.data)
    .then(checkForApiErrorResponse)
    .then((result) => {
      return result as MatchTicketType
    })
    .catch((e) => {
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 404) {
          // we expect 404 if ticket not found, just return nothing
          return
        }
      }
      // otherwise throw further
      throw e
    })
}

function deleteTicket(ticketId: string): Promise<void> {
  return axiosInstance
    .delete(`/tickets/${ticketId}`)
    .then((r) => r.data)
    .then(checkForApiErrorResponse)
    .then((result) => {})
}

export { createTicket, deleteTicket, getTicket, getTicketsAssignment }
