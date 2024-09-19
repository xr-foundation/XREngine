
import {
  projectHistoryMethods,
  projectHistoryPath
} from '@xrengine/common/src/schemas/projects/project-history.schema'
import { Application } from '@xrengine/server-core/declarations'
import { ProjectHistoryService } from './project-history.class'
import projectHistoryDocs from './project-history.docs'
import hooks from './project-history.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    [projectHistoryPath]: ProjectHistoryService
  }
}

export default (app: Application): void => {
  const options = {
    name: projectHistoryPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(projectHistoryPath, new ProjectHistoryService(options), {
    // A list of all methods this service exposes externally
    methods: projectHistoryMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: projectHistoryDocs
  })

  const service = app.service(projectHistoryPath)
  service.hooks(hooks)
}
