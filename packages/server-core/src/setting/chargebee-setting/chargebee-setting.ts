import {
  chargebeeSettingMethods,
  chargebeeSettingPath
} from '@xrengine/common/src/schemas/setting/chargebee-setting.schema'

import { Application } from '../../../declarations'
import { updateAppConfig } from '../../updateAppConfig'
import { ChargebeeSettingService } from './chargebee-setting.class'
import chargebeeSettingDocs from './chargebee-setting.docs'
import hooks from './chargebee-setting.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    [chargebeeSettingPath]: ChargebeeSettingService
  }
}

export default (app: Application): void => {
  const options = {
    name: chargebeeSettingPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(chargebeeSettingPath, new ChargebeeSettingService(options), {
    // A list of all methods this service exposes externally
    methods: chargebeeSettingMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: chargebeeSettingDocs
  })

  const service = app.service(chargebeeSettingPath)
  service.hooks(hooks)

  service.on('patched', () => {
    updateAppConfig()
  })
}
