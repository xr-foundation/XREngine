import { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

import { redisSettingPath, RedisSettingType } from '@xrengine/common/src/schemas/setting/redis-setting.schema'
import { getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import appConfig from '@xrengine/server-core/src/appconfig'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: RedisSettingType[] = await Promise.all(
    [
      {
        enabled: process.env.REDIS_ENABLED === 'true',
        address: process.env.REDIS_ADDRESS || '',
        port: process.env.REDIS_PORT || '',
        password:
          process.env.REDIS_PASSWORD == '' || process.env.REDIS_PASSWORD == null ? '' : process.env.REDIS_PASSWORD
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
    await knex(redisSettingPath).del()

    // Inserts seed entries
    await knex(redisSettingPath).insert(seedData)
  } else {
    const existingData = await knex(redisSettingPath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(redisSettingPath).insert(item)
      }
    }
  }
}
