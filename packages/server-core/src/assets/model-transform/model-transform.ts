
import { modelTransformMethods, modelTransformPath } from '@xrengine/common/src/schemas/assets/model-transform.schema'

import { Application } from '../../../declarations'
import { ModelTransformService } from './model-transform.class'
import modelTransformDocs from './model-transform.docs'
import hooks from './model-transform.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    [modelTransformPath]: ModelTransformService
  }
}

export default (app: Application): void => {
  app.use(modelTransformPath, new ModelTransformService(app), {
    // A list of all methods this service exposes externally
    methods: modelTransformMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: modelTransformDocs
  })

  const service = app.service(modelTransformPath)
  service.hooks(hooks)
}
