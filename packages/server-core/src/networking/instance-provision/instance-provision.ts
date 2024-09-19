import {
  instanceProvisionMethods,
  instanceProvisionPath
} from '@xrengine/common/src/schemas/networking/instance-provision.schema'
import { InstanceID } from '@xrengine/common/src/schemas/networking/instance.schema'
import { ChannelID } from '@xrengine/common/src/schemas/social/channel.schema'
import { LocationID } from '@xrengine/common/src/schemas/social/location.schema'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { InstanceProvisionService } from './instance-provision.class'
import instanceProvisionDocs from './instance-provision.docs'
import hooks from './instance-provision.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    [instanceProvisionPath]: InstanceProvisionService
  }
}

export default (app: Application): void => {
  app.use(instanceProvisionPath, new InstanceProvisionService(app), {
    // A list of all methods this service exposes externally
    methods: instanceProvisionMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: instanceProvisionDocs
  })

  const service = app.service(instanceProvisionPath)
  service.hooks(hooks)

  /**
   * A method which is used to create instance provision
   *
   * @param data which is parsed to create instance provision
   * @returns created instance provision
   */
  service.publish('created', async (data): Promise<any> => {
    try {
      return app.channel(`userIds/${data.userId}`).send({
        ipAddress: data.ipAddress,
        port: data.port,
        locationId: data.locationId as LocationID,
        sceneId: data.sceneId,
        channelId: data.channelId as ChannelID,
        instanceId: data.instanceId as InstanceID
      })
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}
