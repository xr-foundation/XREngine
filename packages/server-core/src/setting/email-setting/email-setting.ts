import { emailSettingMethods, emailSettingPath } from '@xrengine/common/src/schemas/setting/email-setting.schema'

import { Application } from '../../../declarations'
import { updateAppConfig } from '../../updateAppConfig'
import { EmailSettingService } from './email-setting.class'
import emailSettingDocs from './email-setting.docs'
import hooks from './email-setting.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    [emailSettingPath]: EmailSettingService
  }
}

export default (app: Application): void => {
  const options = {
    name: emailSettingPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(emailSettingPath, new EmailSettingService(options), {
    // A list of all methods this service exposes externally
    methods: emailSettingMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: emailSettingDocs
  })

  const service = app.service(emailSettingPath)
  service.hooks(hooks)

  service.on('patched', () => {
    updateAppConfig()
  })
}
