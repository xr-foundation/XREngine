/**
 * An object for swagger documentation configuration
 */

import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  channelUserDataSchema,
  channelUserPatchSchema,
  channelUserQuerySchema,
  channelUserSchema
} from '@xrengine/common/src/schemas/social/channel-user.schema'

export default createSwaggerServiceOptions({
  schemas: {
    channelUserDataSchema,
    channelUserPatchSchema,
    channelUserQuerySchema,
    channelUserSchema
  },
  docs: {
    description: 'Channel user service description',
    securities: ['all']
  }
})
