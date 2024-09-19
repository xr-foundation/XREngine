import {
  engineSettingMethods,
  engineSettingPath,
  EngineSettingType
} from '@xrengine/common/src/schemas/setting/engine-setting.schema'
import { Application } from '@xrengine/server-core/declarations'
import appConfig from '../../appconfig'
import { EngineSettingService } from './engine-setting.class'
import engineSettingDocs from './engine-setting.docs'
import hooks from './engine-setting.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    [engineSettingPath]: EngineSettingService
  }
}

export default (app: Application): void => {
  const options = {
    name: engineSettingPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(engineSettingPath, new EngineSettingService(options), {
    // A list of all methods this service exposes externally
    methods: engineSettingMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: engineSettingDocs
  })

  const service = app.service(engineSettingPath)
  service.hooks(hooks)

  const onUpdateAppConfig = (...args: EngineSettingType[]) => {
    for (const setting of args) {
      if (setting.category === 'task-server') {
        appConfig.taskserver[setting.key] = setting.value
      }
    }
  }

  service.on('patched', onUpdateAppConfig)
  service.on('created', onUpdateAppConfig)
}
