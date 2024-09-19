
import { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

import { zendeskSettingPath, ZendeskSettingType } from '@xrengine/common/src/schemas/setting/zendesk-setting.schema'
import { getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import appConfig from '@xrengine/server-core/src/appconfig'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: ZendeskSettingType[] = await Promise.all(
    [
      {
        name: process.env.ZENDESK_KEY_NAME!,
        secret: process.env.ZENDESK_SECRET!,
        kid: process.env.ZENDESK_KID!
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
    await knex(zendeskSettingPath).del()

    // Inserts seed entries
    await knex(zendeskSettingPath).insert(seedData)
  } else {
    const existingData = await knex(zendeskSettingPath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(zendeskSettingPath).insert(item)
      }
    }
  }
}
