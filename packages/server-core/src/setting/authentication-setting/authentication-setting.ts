import {
  authenticationSettingMethods,
  authenticationSettingPath
} from '@xrengine/common/src/schemas/setting/authentication-setting.schema'

import { Application } from '../../../declarations'
import { updateAppConfig } from '../../updateAppConfig'
import { AuthenticationSettingService } from './authentication-setting.class'
import authenticationSettingDocs from './authentication-setting.docs'
import hooks from './authentication-setting.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    [authenticationSettingPath]: AuthenticationSettingService
  }
}

export default (app: Application): void => {
  const options = {
    name: authenticationSettingPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(authenticationSettingPath, new AuthenticationSettingService(options), {
    // A list of all methods this service exposes externally
    methods: authenticationSettingMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: authenticationSettingDocs
  })

  const service = app.service(authenticationSettingPath)
  service.hooks(hooks)

  service.on('patched', () => {
    updateAppConfig()
  })
}
