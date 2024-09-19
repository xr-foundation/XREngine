
import {
  metabaseSettingMethods,
  metabaseSettingPath
} from '@xrengine/common/src/schemas/integrations/metabase/metabase-setting.schema'
import { Application } from '@xrengine/server-core/declarations'
import { MetabaseSettingService } from './metabase-setting.class'
import metabaseSettingDocs from './metabase-setting.docs'
import hooks from './metabase-setting.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    [metabaseSettingPath]: MetabaseSettingService
  }
}

export default (app: Application): void => {
  const options = {
    name: metabaseSettingPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(metabaseSettingPath, new MetabaseSettingService(options), {
    // A list of all methods this service exposes externally
    methods: metabaseSettingMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: metabaseSettingDocs
  })

  const service = app.service(metabaseSettingPath)
  service.hooks(hooks)
}
