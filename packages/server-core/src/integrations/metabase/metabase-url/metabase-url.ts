
import {
  metabaseUrlMethods,
  metabaseUrlPath
} from '@xrengine/common/src/schemas/integrations/metabase/metabase-url.schema'
import { Application } from '@xrengine/server-core/declarations'
import { MetabaseUrlService } from './metabase-url.class'
import metabaseUrlDocs from './metabase-url.docs'
import hooks from './metabase-url.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    [metabaseUrlPath]: MetabaseUrlService
  }
}

export default (app: Application): void => {
  app.use(metabaseUrlPath, new MetabaseUrlService(), {
    // A list of all methods this service exposes externally
    methods: metabaseUrlMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: metabaseUrlDocs
  })

  const service = app.service(metabaseUrlPath)
  service.hooks(hooks)
}
