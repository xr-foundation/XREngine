
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import {
  MailchimpSettingQuery,
  MailchimpSettingType
} from '@xrengine/common/src/schemas/setting/mailchimp-setting.schema'
import { fromDateTimeSql, getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import type { HookContext } from '@xrengine/server-core/declarations'

export const mailchimpSettingResolver = resolve<MailchimpSettingType, HookContext>({
  createdAt: virtual(async (mailchimpSetting) => fromDateTimeSql(mailchimpSetting.createdAt)),
  updatedAt: virtual(async (mailchimpSetting) => fromDateTimeSql(mailchimpSetting.updatedAt))
})

export const mailchimpSettingExternalResolver = resolve<MailchimpSettingType, HookContext>({})

export const mailchimpSettingDataResolver = resolve<MailchimpSettingType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const mailchimpSettingPatchResolver = resolve<MailchimpSettingType, HookContext>({
  updatedAt: getDateTimeSql
})

export const mailchimpSettingQueryResolver = resolve<MailchimpSettingQuery, HookContext>({})
