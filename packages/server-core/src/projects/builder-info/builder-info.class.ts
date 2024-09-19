
import { ServiceInterface } from '@feathersjs/feathers'

import { BuilderInfoType } from '@xrengine/common/src/schemas/projects/builder-info.schema'
import { getState } from '@xrengine/hyperflux'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { ServerState } from '../../ServerState'
import { dockerHubRegex, engineVersion, privateECRTagRegex, publicECRTagRegex } from '../project/project-helper'

export class BuilderInfoService implements ServiceInterface<BuilderInfoType> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async get() {
    const returned: BuilderInfoType = {
      engineVersion: engineVersion || '',
      engineCommit: ''
    }
    const k8AppsClient = getState(ServerState).k8AppsClient
    const k8BatchClient = getState(ServerState).k8BatchClient

    if (k8AppsClient) {
      const builderLabelSelector = `app.kubernetes.io/instance=${config.server.releaseName}-builder`

      const builderJob = await k8BatchClient.listNamespacedJob(
        'default',
        undefined,
        false,
        undefined,
        undefined,
        builderLabelSelector
      )

      let builderContainer
      if (builderJob && builderJob.body.items.length > 0) {
        builderContainer = builderJob?.body?.items[0]?.spec?.template?.spec?.containers?.find(
          (container) => container.name === 'xrengine-builder'
        )
      } else {
        const builderDeployment = await k8AppsClient.listNamespacedDeployment(
          'default',
          'false',
          false,
          undefined,
          undefined,
          builderLabelSelector
        )
        builderContainer = builderDeployment?.body?.items[0]?.spec?.template?.spec?.containers?.find(
          (container) => container.name === 'xrengine-builder'
        )
      }
      if (builderContainer) {
        const image = builderContainer.image
        if (image && typeof image === 'string') {
          const dockerHubRegexExec = dockerHubRegex.exec(image)
          const publicECRRegexExec = publicECRTagRegex.exec(image)
          const privateECRRegexExec = privateECRTagRegex.exec(image)
          returned.engineCommit =
            dockerHubRegexExec && !publicECRRegexExec
              ? dockerHubRegexExec[1]
              : publicECRRegexExec
              ? publicECRRegexExec[1]
              : privateECRRegexExec
              ? privateECRRegexExec[2]
              : ''
        }
      }
    }
    return returned
  }
}
