
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import {
  EmailAuthType,
  EmailSettingDatabaseType,
  EmailSettingQuery,
  EmailSettingType,
  EmailSmtpType,
  EmailSubjectType
} from '@xrengine/common/src/schemas/setting/email-setting.schema'
import { fromDateTimeSql, getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import type { HookContext } from '@xrengine/server-core/declarations'

export const emailDbToSchema = (rawData: EmailSettingDatabaseType): EmailSettingType => {
  let smtp = JSON.parse(rawData.smtp) as EmailSmtpType

  // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
  // was serialized multiple times, therefore we need to parse it twice.
  if (typeof smtp === 'string') {
    smtp = JSON.parse(smtp)

    // We need to deserialized nested objects of pre-feathers 5 data.
    if (typeof smtp.auth === 'string') {
      smtp.auth = JSON.parse(smtp.auth) as EmailAuthType
    }
  }

  let subject = JSON.parse(rawData.subject) as EmailSubjectType

  // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
  // was serialized multiple times, therefore we need to parse it twice.
  if (typeof subject === 'string') {
    subject = JSON.parse(subject)
  }

  return {
    ...rawData,
    smtp,
    subject
  }
}

export const emailSettingResolver = resolve<EmailSettingType, HookContext>(
  {
    createdAt: virtual(async (emailSetting) => fromDateTimeSql(emailSetting.createdAt)),
    updatedAt: virtual(async (emailSetting) => fromDateTimeSql(emailSetting.updatedAt))
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return emailDbToSchema(rawData)
    }
  }
)

export const emailSettingExternalResolver = resolve<EmailSettingType, HookContext>({})

export const emailSettingDataResolver = resolve<EmailSettingDatabaseType, HookContext>(
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
        smtp: JSON.stringify(rawData.smtp),
        subject: JSON.stringify(rawData.subject)
      }
    }
  }
)

export const emailSettingPatchResolver = resolve<EmailSettingType, HookContext>(
  {
    updatedAt: getDateTimeSql
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return {
        ...rawData,
        smtp: JSON.stringify(rawData.smtp),
        subject: JSON.stringify(rawData.subject)
      }
    }
  }
)

export const emailSettingQueryResolver = resolve<EmailSettingQuery, HookContext>({})
