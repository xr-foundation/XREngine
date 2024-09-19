import { Knex } from 'knex'

import {
  analyticsPath,
  channelPath,
  ChannelType,
  instanceAttendancePath,
  instancePath,
  userPath
} from '@xrengine/common/src/schema.type.module'
import config from '@xrengine/server-core/src/appconfig'
import multiLogger from '@xrengine/server-core/src/ServerLogger'

const logger = multiLogger.child({ component: 'taskserver:collect-analytics' })

const DEFAULT_INTERVAL_SECONDS = 1800
const configInterval = parseInt(config.taskserver.processInterval)
const interval = (configInterval || DEFAULT_INTERVAL_SECONDS) * 1000

export default (app): void => {
  setInterval(async () => {
    logger.info('Collecting analytics at %s.', new Date().toString())
    const activeLocations: any[] = []
    const activeScenes: any[] = []
    const activeChannels = (await app.service(channelPath).find({
      paginate: false,
      isInternal: true
    })) as ChannelType[]

    const knexClient: Knex = app.get('knexClient')

    const instanceUsers = await knexClient
      .from(userPath)
      .join(instanceAttendancePath, `${instanceAttendancePath}.userId`, `${userPath}.id`)
      .where(`${instanceAttendancePath}.ended`, false)
      .andWhere(`${instanceAttendancePath}.isChannel`, false)
      .select()
      .options({ nestTables: true })

    const channelUsers = await knexClient
      .from(userPath)
      .join(instanceAttendancePath, `${instanceAttendancePath}.userId`, `${userPath}.id`)
      .where(`${instanceAttendancePath}.ended`, false)
      .andWhere(`${instanceAttendancePath}.isChannel`, true)
      .select()
      .options({ nestTables: true })

    const activeInstances = await app.service(instancePath).find({
      query: {
        ended: {
          $ne: 1
        }
      },
      isInternal: true
    })

    for (const instance of activeInstances.data) {
      if (instance.location) {
        if (activeLocations.indexOf(instance.location.id) < 0) activeLocations.push(instance.location.id)
        if (activeScenes.indexOf(instance.location.sceneId) < 0) activeScenes.push(instance.location.sceneId)
      }
    }

    await Promise.all([
      app.service(analyticsPath).create({
        type: 'activeChannels',
        count: activeChannels.length
      }),
      app.service(analyticsPath).create({
        type: 'instanceUsers',
        count: instanceUsers.length
      }),
      app.service(analyticsPath).create({
        type: 'channelUsers',
        count: channelUsers.length
      }),
      app.service(analyticsPath).create({
        type: 'activeLocations',
        count: activeLocations.length
      }),
      app.service(analyticsPath).create({
        type: 'activeScenes',
        count: activeScenes.length
      }),
      app.service(analyticsPath).create({
        type: 'activeInstances',
        count: activeInstances.total
      })
    ])
  }, interval)
}
