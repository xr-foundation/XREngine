
import { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

import {
  chargebeeSettingPath,
  ChargebeeSettingType
} from '@xrengine/common/src/schemas/setting/chargebee-setting.schema'
import { getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import appConfig from '@xrengine/server-core/src/appconfig'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: ChargebeeSettingType[] = await Promise.all(
    [
      {
        url: process.env.CHARGEBEE_SITE + '.chargebee.com' || 'dummy.not-chargebee.com',
        apiKey: process.env.CHARGEBEE_API_KEY || ''
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
    await knex(chargebeeSettingPath).del()

    // Inserts seed entries
    await knex(chargebeeSettingPath).insert(seedData)
  } else {
    const existingData = await knex(chargebeeSettingPath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(chargebeeSettingPath).insert(item)
      }
    }
  }
}
