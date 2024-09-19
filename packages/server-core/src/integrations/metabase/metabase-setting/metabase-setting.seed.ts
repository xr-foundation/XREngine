import { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

import {
  MetabaseSettingType,
  metabaseSettingPath
} from '@xrengine/common/src/schemas/integrations/metabase/metabase-setting.schema'
import { getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import appConfig from '@xrengine/server-core/src/appconfig'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: MetabaseSettingType[] = await Promise.all(
    [
      {
        siteUrl: process.env.METABASE_SITE_URL!,
        secretKey: process.env.METABASE_SECRET_KEY!,
        environment: process.env.METABASE_ENVIRONMENT!,
        crashDashboardId: process.env.METABASE_CRASH_DASHBOARD_ID!,
        expiration: isNaN(parseInt(process.env.METABASE_EXPIRATION!)) ? 10 : parseInt(process.env.METABASE_EXPIRATION!)
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
    await knex(metabaseSettingPath).del()

    // Inserts seed entries
    await knex(metabaseSettingPath).insert(seedData)
  } else {
    const existingData = await knex(metabaseSettingPath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(metabaseSettingPath).insert(item)
      }
    }
  }
}
