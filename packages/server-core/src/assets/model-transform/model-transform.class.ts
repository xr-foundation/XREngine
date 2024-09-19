import { BadRequest } from '@feathersjs/errors/lib'
import { ServiceInterface } from '@feathersjs/feathers/lib'
import { KnexAdapterParams } from '@feathersjs/knex/lib'
import appRootPath from 'app-root-path'
import path from 'path'

import { transformModel } from '@xrengine/common/src/model/ModelTransformFunctions'
import { ModelTransformParameters } from '@xrengine/engine/src/assets/classes/ModelTransform'
import { Application } from '@xrengine/server-core/declarations'

import config from '../../appconfig'
import { createExecutorJob } from '../../k8s-job-helper'
import { getModelTransformJobBody } from './model-transform.helpers'

export interface ModelTransformParams extends KnexAdapterParams {
  transformParameters: ModelTransformParameters
}

/**
 * A class for Model Transform service
 */
export class ModelTransformService implements ServiceInterface<void> {
  app: Application
  rootPath: string

  constructor(app: Application) {
    this.app = app
    this.rootPath = path.join(appRootPath.path, 'packages/projects/projects')
  }

  processPath(inPath: string): [string, string] {
    const pathData = /.*projects\/(.*)\.(glb|gltf)$/.exec(inPath)
    if (!pathData) throw Error('could not extract path data')
    const [_, filePath, extension] = pathData
    return [path.join(this.rootPath, filePath), extension]
  }

  async create(data: any): Promise<void> {
    const createParams: ModelTransformParameters = data
    console.log('config', config)
    if (!config.kubernetes?.enabled) {
      await transformModel(createParams)
      return
    }
    try {
      const transformParms = createParams
      const [commonPath, extension] = this.processPath(createParams.src)
      const inPath = `${commonPath}.${extension}`
      const outPath = transformParms.dst
        ? `${commonPath.replace(/[^/]+$/, transformParms.dst)}.${extension}`
        : `${commonPath}-transformed.${extension}`
      const resourceUri = transformParms.resourceUri ?? ''
      const jobBody = await getModelTransformJobBody(this.app, createParams)
      const jobLabelSelector = `xrengine/jobName=${jobBody.metadata!.name},xrengine/release=${
        process.env.RELEASE_NAME
      },xrengine/modelTransformer=true`
      const jobId = `model-transform-${inPath}-${outPath}-${resourceUri}`
      const jobFinishedPromise = createExecutorJob(this.app, jobBody, jobLabelSelector, 600, jobId)
      await jobFinishedPromise
      return
    } catch (e) {
      console.log('error transforming model', e)
      throw new BadRequest('error transforming model', e)
    }
  }
}
