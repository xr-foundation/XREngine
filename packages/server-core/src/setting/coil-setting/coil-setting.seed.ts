import { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

import { coilSettingPath, CoilSettingType } from '@xrengine/common/src/schemas/setting/coil-setting.schema'
import { getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import appConfig from '@xrengine/server-core/src/appconfig'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: CoilSettingType[] = await Promise.all(
    [
      {
        paymentPointer: process.env.COIL_PAYMENT_POINTER || '',
        clientId: process.env.COIL_API_CLIENT_ID || '',
        clientSecret: process.env.COIL_API_CLIENT_SECRET || ''
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
    await knex(coilSettingPath).del()

    // Inserts seed entries
    await knex(coilSettingPath).insert(seedData)
  } else {
    const existingData = await knex(coilSettingPath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(coilSettingPath).insert(item)
      }
    }
  }
}
