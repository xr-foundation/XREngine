
import { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

import { RouteID, routePath, RouteType } from '@xrengine/common/src/schemas/route/route.schema'
import { getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import appConfig from '@xrengine/server-core/src/appconfig'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: RouteType[] = await Promise.all(
    [
      {
        project: 'xrengine/default-project',
        route: '/'
      },
      {
        project: 'xrengine/default-project',
        route: '/location'
      },
      {
        project: 'xrengine/default-project',
        route: '/admin'
      },
      {
        project: 'xrengine/default-project',
        route: '/studio'
      },
      {
        project: 'xrengine/default-project',
        route: '/studio-old'
      },
      {
        project: 'xrengine/default-project',
        route: '/capture'
      },
      {
        project: 'xrengine/default-project',
        route: '/chat'
      }
    ].map(async (item) => ({
      ...item,
      id: uuidv4() as RouteID,
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }))
  )

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(routePath).del()

    // Inserts seed entries
    await knex(routePath).insert(seedData)
  } else {
    const existingData = await knex(routePath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(routePath).insert(item)
      }
    }
  }
}
