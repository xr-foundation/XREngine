import { zendeskSettingMethods, zendeskSettingPath } from '@xrengine/common/src/schemas/setting/zendesk-setting.schema'

import { Application } from '../../../declarations'
import { updateAppConfig } from '../../updateAppConfig'
import { ZendeskSettingService } from './zendesk-setting.class'
import zendeskSettingDocs from './zendesk-setting.docs'
import hooks from './zendesk-setting.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    [zendeskSettingPath]: ZendeskSettingService
  }
}

export default (app: Application): void => {
  const options = {
    name: zendeskSettingPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(zendeskSettingPath, new ZendeskSettingService(options), {
    // A list of all methods this service exposes externally
    methods: zendeskSettingMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: zendeskSettingDocs
  })

  const service = app.service(zendeskSettingPath)
  service.hooks(hooks)

  service.on('patched', () => {
    updateAppConfig()
  })

  service.on('created', () => {
    updateAppConfig()
  })
}
