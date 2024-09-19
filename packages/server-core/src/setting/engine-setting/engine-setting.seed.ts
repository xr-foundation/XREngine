import { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

import { EngineSettings } from '@xrengine/common/src/constants/EngineSettings'
import { engineSettingPath, EngineSettingType } from '@xrengine/common/src/schemas/setting/engine-setting.schema'
import { getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import appConfig from '@xrengine/server-core/src/appconfig'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const taskServerSeedData: EngineSettingType[] = await Promise.all(
    [
      // Task Server Settings:
      {
        key: EngineSettings.TaskServer.Port,
        value: process.env.TASKSERVER_PORT || '3030'
      },
      {
        key: EngineSettings.TaskServer.ProcessInterval,
        value: process.env.TASKSERVER_PROCESS_INTERVAL_SECONDS || '30'
      }
    ].map(async (item) => ({
      ...item,
      id: uuidv4(),
      type: 'private' as EngineSettingType['type'],
      category: 'task-server' as EngineSettingType['category'],
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }))
  )

  const seedData: EngineSettingType[] = [...taskServerSeedData]

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(engineSettingPath).del()

    // Inserts seed entries
    await knex(engineSettingPath).insert(seedData)
  } else {
    const existingData = await knex(engineSettingPath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(engineSettingPath).insert(item)
      }
    }
  }
}
