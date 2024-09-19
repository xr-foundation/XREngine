
import { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

import { helmSettingPath, HelmSettingType } from '@xrengine/common/src/schemas/setting/helm-setting.schema'
import { getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import appConfig from '@xrengine/server-core/src/appconfig'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: HelmSettingType[] = await Promise.all(
    [
      {
        main: '',
        builder: ''
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
    await knex(helmSettingPath).del()

    // Inserts seed entries
    await knex(helmSettingPath).insert(seedData)
  } else {
    const existingData = await knex(helmSettingPath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(helmSettingPath).insert(item)
      }
    }
  }
}
