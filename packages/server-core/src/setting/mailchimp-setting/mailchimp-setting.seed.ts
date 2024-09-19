import { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

import {
  mailchimpSettingPath,
  MailchimpSettingType
} from '@xrengine/common/src/schemas/setting/mailchimp-setting.schema'
import { getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import appConfig from '@xrengine/server-core/src/appconfig'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: MailchimpSettingType[] = await Promise.all(
    [
      {
        key: process.env.MAILCHIMP_KEY!,
        server: process.env.MAILCHIMP_SERVER!,
        audienceId: process.env.MAILCHIMP_AUDIENCE_ID!,
        defaultTags: process.env.MAILCHIMP_DEFAULT_TAGS!
      }
    ].map(async (item) => ({
      ...item,
      id: uuidv4(),
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }))
  )

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(mailchimpSettingPath).del()

    // Inserts seed entries
    await knex(mailchimpSettingPath).insert(seedData)
  } else {
    const existingData = await knex(mailchimpSettingPath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(mailchimpSettingPath).insert(item)
      }
    }
  }
}
