
import { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

import { EmailSettingDatabaseType, emailSettingPath } from '@xrengine/common/src/schemas/setting/email-setting.schema'
import { getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import appConfig from '@xrengine/server-core/src/appconfig'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: EmailSettingDatabaseType[] = await Promise.all(
    [
      {
        smtp: JSON.stringify({
          host: process.env.SMTP_HOST || 'test',
          port: parseInt(process.env.SMTP_PORT!) || 'test',
          secure: process.env.SMTP_SECURE === 'true' || true,
          auth: {
            user: process.env.SMTP_USER || 'test',
            pass: process.env.SMTP_PASS || 'test'
          }
        }),
        // Name and email of default sender (for login emails, etc)
        from: `${process.env.SMTP_FROM_NAME}` + ` <${process.env.SMTP_FROM_EMAIL}>` || 'test',
        subject: JSON.stringify({
          // Subject of the Login Link email
          'new-user': 'XREngine signup',
          location: 'XREngine location link',
          instance: 'XREngine location link',
          login: 'XREngine login link',
          friend: 'XREngine friend request',
          channel: 'XREngine channel invitation'
        }),
        smsNameCharacterLimit: 20
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
    await knex(emailSettingPath).del()

    // Inserts seed entries
    await knex(emailSettingPath).insert(seedData)
  } else {
    const existingData = await knex(emailSettingPath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(emailSettingPath).insert(item)
      }
    }
  }
}
