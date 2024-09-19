
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import {
  ServerHubType,
  ServerSettingDatabaseType,
  ServerSettingQuery,
  ServerSettingType
} from '@xrengine/common/src/schemas/setting/server-setting.schema'
import { fromDateTimeSql, getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import type { HookContext } from '@xrengine/server-core/declarations'

export const serverDbToSchema = (rawData: ServerSettingDatabaseType): ServerSettingType => {
  let hub = JSON.parse(rawData.hub) as ServerHubType

  // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
  // was serialized multiple times, therefore we need to parse it twice.
  if (typeof hub === 'string') {
    hub = JSON.parse(hub)
  }

  return {
    ...rawData,
    hub
  }
}

export const serverSettingResolver = resolve<ServerSettingType, HookContext>(
  {
    createdAt: virtual(async (serverSetting) => fromDateTimeSql(serverSetting.createdAt)),
    updatedAt: virtual(async (serverSetting) => fromDateTimeSql(serverSetting.updatedAt))
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return serverDbToSchema(rawData)
    }
  }
)

export const serverSettingExternalResolver = resolve<ServerSettingType, HookContext>({})

export const serverSettingDataResolver = resolve<ServerSettingDatabaseType, HookContext>(
  {
    id: async () => {
      return uuidv4()
    },
    createdAt: getDateTimeSql,
    updatedAt: getDateTimeSql
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return {
        ...rawData,
        hub: JSON.stringify(rawData.hub)
      }
    }
  }
)

export const serverSettingPatchResolver = resolve<ServerSettingType, HookContext>(
  {
    updatedAt: getDateTimeSql
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return {
        ...rawData,
        hub: JSON.stringify(rawData.hub)
      }
    }
  }
)

export const serverSettingQueryResolver = resolve<ServerSettingQuery, HookContext>({})
