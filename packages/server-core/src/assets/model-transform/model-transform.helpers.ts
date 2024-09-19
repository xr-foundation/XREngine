
import * as k8s from '@kubernetes/client-node'

import { objectToArgs } from '@xrengine/common/src/utils/objectToCommandLineArgs'
import { ModelTransformParameters } from '@xrengine/engine/src/assets/classes/ModelTransform'

import { Application } from '../../../declarations'
import { getJobBody } from '../../k8s-job-helper'

export async function getModelTransformJobBody(
  app: Application,
  createParams: ModelTransformParameters
): Promise<k8s.V1Job> {
  const command = [
    'npx',
    'cross-env',
    'ts-node',
    '--swc',
    'packages/server-core/src/assets/model-transform/model-transform.job.ts',
    ...objectToArgs(createParams)
  ]

  const labels = {
    'xrengine/modelTransformer': 'true',
    'xrengine/transformSource': createParams.src,
    'xrengine/transformDestination': createParams.dst,
    'xrengine/release': process.env.RELEASE_NAME!
  }

  const name = `${process.env.RELEASE_NAME}-${createParams.src}-${createParams.dst}-transform`

  return getJobBody(app, command, name, labels)
}
