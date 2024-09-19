
import * as k8s from '@kubernetes/client-node'

import { getState } from '@xrengine/hyperflux'

import config from '../appconfig'
import logger from '../ServerLogger'
import { ServerState } from '../ServerState'

export default async () => {
  const k8AppsClient = getState(ServerState).k8AppsClient

  if (k8AppsClient) {
    try {
      logger.info('Attempting to refresh API pods')
      const refreshApiPodResponse = await k8AppsClient.patchNamespacedDeployment(
        `${config.server.releaseName}-xrengine-api`,
        'default',
        {
          spec: {
            template: {
              metadata: {
                annotations: {
                  'kubectl.kubernetes.io/restartedAt': new Date().toISOString()
                }
              }
            }
          }
        },
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        {
          headers: {
            'Content-Type': k8s.PatchUtils.PATCH_FORMAT_STRATEGIC_MERGE_PATCH
          }
        }
      )
      logger.info(refreshApiPodResponse, 'updateBuilderTagResponse')
    } catch (e) {
      logger.error(e)
      return e
    }
  }
}
