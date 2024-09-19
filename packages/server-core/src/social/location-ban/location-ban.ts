import {
  locationBanMethods,
  locationBanPath,
  LocationBanType
} from '@xrengine/common/src/schemas/social/location-ban.schema'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { LocationBanService } from './location-ban.class'
import locationBanDocs from './location-ban.docs'
import hooks from './location-ban.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    [locationBanPath]: LocationBanService
  }
}

export default (app: Application): void => {
  const options = {
    name: locationBanPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(locationBanPath, new LocationBanService(options), {
    // A list of all methods this service exposes externally
    methods: locationBanMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: locationBanDocs
  })

  const service = app.service(locationBanPath)
  service.hooks(hooks)

  service.publish('created', async (data: LocationBanType) => {
    try {
      return Promise.all([app.channel(`userIds/${data.userId}`).send({ locationBan: data })])
    } catch (err) {
      logger.error(err)
    }
  })
}
