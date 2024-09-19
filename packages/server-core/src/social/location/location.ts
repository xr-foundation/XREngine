
import { locationMethods, locationPath } from '@xrengine/common/src/schemas/social/location.schema'

import { Application } from '../../../declarations'
import { LocationService } from './location.class'
import locationDocs from './location.docs'
import hooks from './location.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    [locationPath]: LocationService
  }
}

export default (app: Application): void => {
  const options = {
    name: locationPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(locationPath, new LocationService(options), {
    // A list of all methods this service exposes externally
    methods: locationMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: locationDocs
  })

  const service = app.service(locationPath)
  service.hooks(hooks)
}
