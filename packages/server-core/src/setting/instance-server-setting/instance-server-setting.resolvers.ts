// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import {
  InstanceServerSettingQuery,
  InstanceServerSettingType
} from '@xrengine/common/src/schemas/setting/instance-server-setting.schema'
import { fromDateTimeSql, getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import type { HookContext } from '@xrengine/server-core/declarations'

export const instanceServerSettingResolver = resolve<InstanceServerSettingType, HookContext>(
  {
    createdAt: virtual(async (instanceServerSetting) => fromDateTimeSql(instanceServerSetting.createdAt)),
    updatedAt: virtual(async (instanceServerSetting) => fromDateTimeSql(instanceServerSetting.updatedAt))
  },
  {
    converter: async (rawData): Promise<InstanceServerSettingType> => {
      const webRTCSettings = JSON.parse(rawData.webRTCSettings)
      return {
        ...rawData,
        webRTCSettings
      }
    }
  }
)

export const instanceServerSettingExternalResolver = resolve<InstanceServerSettingType, HookContext>({})

export const instanceServerSettingDataResolver = resolve<InstanceServerSettingType, HookContext>(
  {
    id: async () => {
      return uuidv4()
    },
    createdAt: getDateTimeSql,
    updatedAt: getDateTimeSql
  },
  {
    converter: async (rawData, context) => {
      try {
        if (typeof rawData.webRTCSettings.iceServers === 'string')
          rawData.webRTCSettings.iceServers = JSON.parse(rawData.webRTCSettings.iceServers)
      } catch (err) {
        // Do nothing
      }

      return {
        ...rawData,
        webRTCSettings: JSON.stringify(rawData.webRTCSettings)
      }
    }
  }
)

export const instanceServerSettingPatchResolver = resolve<InstanceServerSettingType, HookContext>(
  {
    updatedAt: getDateTimeSql
  },
  {
    converter: async (rawData, context) => {
      try {
        if (typeof rawData.webRTCSettings.iceServers === 'string')
          rawData.webRTCSettings.iceServers = JSON.parse(rawData.webRTCSettings.iceServers)
      } catch (err) {
        // Do nothing
      }
      return {
        ...rawData,
        webRTCSettings: JSON.stringify(rawData.webRTCSettings)
      }
    }
  }
)

export const instanceServerSettingQueryResolver = resolve<InstanceServerSettingQuery, HookContext>({})
