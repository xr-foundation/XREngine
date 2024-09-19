
import { redisSettingMethods, redisSettingPath } from '@xrengine/common/src/schemas/setting/redis-setting.schema'

import { Application } from '../../../declarations'
import { updateAppConfig } from '../../updateAppConfig'
import { RedisSettingService } from './redis-setting.class'
import redisSettingDocs from './redis-setting.docs'
import hooks from './redis-setting.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    [redisSettingPath]: RedisSettingService
  }
}

export default (app: Application): void => {
  const options = {
    name: redisSettingPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(redisSettingPath, new RedisSettingService(options), {
    // A list of all methods this service exposes externally
    methods: redisSettingMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: redisSettingDocs
  })

  const service = app.service(redisSettingPath)
  service.hooks(hooks)

  service.on('patched', () => {
    updateAppConfig()
  })
}
