import {
  mailchimpSettingMethods,
  mailchimpSettingPath
} from '@xrengine/common/src/schemas/setting/mailchimp-setting.schema'
import { Application } from '../../../declarations'
import { updateAppConfig } from '../../updateAppConfig'
import { MailchimpSettingService } from './mailchimp-setting.class'
import mailchimpSettingDocs from './mailchimp-setting.docs'
import hooks from './mailchimp-setting.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    [mailchimpSettingPath]: MailchimpSettingService
  }
}

export default (app: Application): void => {
  const options = {
    name: mailchimpSettingPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(mailchimpSettingPath, new MailchimpSettingService(options), {
    // A list of all methods this service exposes externally
    methods: mailchimpSettingMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: mailchimpSettingDocs
  })

  const service = app.service(mailchimpSettingPath)
  service.hooks(hooks)

  service.on('patched', () => {
    updateAppConfig()
  })

  service.on('created', () => {
    updateAppConfig()
  })
}
