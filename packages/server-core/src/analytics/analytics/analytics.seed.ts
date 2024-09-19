
import { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

import { analyticsPath, AnalyticsType } from '@xrengine/common/src/schemas/analytics/analytics.schema'
import { getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import appConfig from '@xrengine/server-core/src/appconfig'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: AnalyticsType[] = await Promise.all(
    [
      {
        count: 200,
        type: 'activeParties'
      },
      {
        count: 100,
        type: 'activeInstances'
      },
      {
        count: 150,
        type: 'activeLocations'
      },
      {
        count: 120,
        type: 'activeScenes'
      },
      {
        count: 110,
        type: 'channelUsers'
      },
      {
        count: 200,
        type: 'instanceUsers'
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
    await knex(analyticsPath).del()

    // Inserts seed entries
    await knex(analyticsPath).insert(seedData)
  } else {
    const existingData = await knex(analyticsPath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(analyticsPath).insert(item)
      }
    }
  }
}
