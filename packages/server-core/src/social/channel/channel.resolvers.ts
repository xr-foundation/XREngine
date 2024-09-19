
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { Paginated } from '@feathersjs/feathers'
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { channelUserPath, ChannelUserType } from '@xrengine/common/src/schemas/social/channel-user.schema'
import { ChannelID, ChannelQuery, ChannelType } from '@xrengine/common/src/schemas/social/channel.schema'
import { messagePath, MessageType } from '@xrengine/common/src/schemas/social/message.schema'
import { fromDateTimeSql, getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import type { HookContext } from '@xrengine/server-core/declarations'

export const channelResolver = resolve<ChannelType, HookContext>({
  createdAt: virtual(async (channel) => fromDateTimeSql(channel.createdAt)),
  updatedAt: virtual(async (channel) => fromDateTimeSql(channel.updatedAt))
})

export const channelExternalResolver = resolve<ChannelType, HookContext>({
  channelUsers: virtual(async (channel, context) => {
    if (context.method === 'find' && !context.params.query.instanceId) {
      return (await context.app.service(channelUserPath).find({
        query: {
          channelId: channel.id
        },
        paginate: false
      })) as ChannelUserType[]
    }
  }),
  messages: virtual(async (channel, context) => {
    if (context.method === 'find' && context.params.user) {
      const messages = (await context.app.service(messagePath).find({
        query: {
          channelId: channel.id,
          $limit: 20,
          $sort: {
            createdAt: -1
          }
        }
      })) as Paginated<MessageType>

      return messages.data
    }
  })
})

export const channelDataResolver = resolve<ChannelType, HookContext>({
  id: async () => {
    return uuidv4() as ChannelID
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const channelPatchResolver = resolve<ChannelType, HookContext>({
  updatedAt: getDateTimeSql
})

export const channelQueryResolver = resolve<ChannelQuery, HookContext>({})
