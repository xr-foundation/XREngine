import { Knex } from 'knex'
import _ from 'lodash'

import {
  instanceAttendancePath,
  InstanceAttendanceType
} from '@xrengine/common/src/schemas/networking/instance-attendance.schema'
import {
  UserID,
  userMethods,
  userPath,
  UserPublicPatch,
  UserType
} from '@xrengine/common/src/schemas/user/user.schema'

import { Application, HookContext } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'
import { UserService } from './user.class'
import userDocs from './user.docs'
import hooks from './user.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    [userPath]: UserService
  }
}

export default (app: Application): void => {
  const options = {
    name: userPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(userPath, new UserService(options), {
    // A list of all methods this service exposes externally
    methods: userMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: userDocs
  })

  const service = app.service(userPath)
  service.hooks(hooks)

  // when seeding db, no need to patch users
  if (config.db.forceRefresh) return

  /**
   * This method find all users
   * @returns users
   */
  service.publish('patched', async (data: UserType, context: HookContext) => {
    try {
      const userID = data.id
      const dataToSend = {
        id: data.id,
        name: data.name
      } as UserPublicPatch

      const instances = (await app.service(instanceAttendancePath).find({
        query: {
          userId: userID,
          ended: false
        },
        headers: context.params.headers,
        paginate: false
      })) as any as InstanceAttendanceType[]

      const knexClient: Knex = app.get('knexClient')

      const layerUsers = await knexClient
        .from(userPath)
        .join(instanceAttendancePath, `${instanceAttendancePath}.userId`, '=', `${userPath}.id`)
        .whereIn(
          `${instanceAttendancePath}.instanceId`,
          instances.map((instance) => instance.instanceId)
        )
        .whereNot(`${userPath}.id`, userID)
        .select()
        .options({ nestTables: true })

      const targetIds = _.uniq(layerUsers.map((item) => item.user.id))

      return Promise.all(targetIds.map((userId: UserID) => app.channel(`userIds/${userId}`).send(dataToSend)))
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}
