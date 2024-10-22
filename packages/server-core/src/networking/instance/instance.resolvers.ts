
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { BadRequest } from '@feathersjs/errors'
import {
  InstanceID,
  InstanceQuery,
  InstanceType,
  instancePath
} from '@xrengine/common/src/schemas/networking/instance.schema'
import { channelPath } from '@xrengine/common/src/schemas/social/channel.schema'
import { locationPath } from '@xrengine/common/src/schemas/social/location.schema'
import { fromDateTimeSql, getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import type { HookContext } from '@xrengine/server-core/declarations'

export const instanceResolver = resolve<InstanceType, HookContext>({
  location: virtual(async (instance, context) => {
    if (context.event !== 'removed' && instance.locationId)
      return await context.app.service(locationPath).get(instance.locationId)
  }),
  assignedAt: virtual(async (instance) => (instance.assignedAt ? fromDateTimeSql(instance.assignedAt) : '')),
  createdAt: virtual(async (instance) => fromDateTimeSql(instance.createdAt)),
  updatedAt: virtual(async (instance) => fromDateTimeSql(instance.updatedAt))
})

export const instanceExternalResolver = resolve<InstanceType, HookContext>({})

export const instanceDataResolver = resolve<InstanceType, HookContext>({
  id: async () => {
    return uuidv4() as InstanceID
  },
  projectId: async (value, instance, context) => {
    try {
      // Populate projectId from locationId
      if (instance.locationId) {
        const locationData = await context.app.service(locationPath).get(instance.locationId)
        if (locationData) {
          return locationData.projectId
        } else {
          throw new BadRequest('Error populating projectId into world instance')
        }
      }
      // Populate projectId from channelId
      if (instance.channelId) {
        const channelData = await context.app.service(channelPath).get(instance.channelId)
        if (channelData.instanceId) {
          const channelInstance = await context.app.service(instancePath).get(channelData.instanceId)
          return channelInstance.projectId
        }
        return ''
      }
    } catch (error) {
      throw new BadRequest('Error populating projectId into instance')
    }
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const instancePatchResolver = resolve<InstanceType, HookContext>({
  updatedAt: getDateTimeSql
})

export const instanceQueryResolver = resolve<InstanceQuery, HookContext>({})
