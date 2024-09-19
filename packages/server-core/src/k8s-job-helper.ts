
import { apiJobPath } from '@xrengine/common/src/schemas/cluster/api-job.schema'
import { getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import { getState } from '@xrengine/hyperflux'
import * as k8s from '@kubernetes/client-node'
import { Application } from '../declarations'
import { ServerState } from './ServerState'
import config from './appconfig'
import { getPodsData } from './cluster/pods/pods-helper'

export const createExecutorJob = async (
  app: Application,
  jobBody: k8s.V1Job,
  jobLabelSelector: string,
  timeout: number,
  jobId: string,
  waitForFinish = true
) => {
  const k8BatchClient = getState(ServerState).k8BatchClient

  const name = jobBody.metadata!.name!
  try {
    await k8BatchClient.deleteNamespacedJob(name, 'default', undefined, undefined, 0, undefined, 'Background')
  } catch (err) {
    console.log('Old job did not exist, continuing...')
  }

  await k8BatchClient.createNamespacedJob('default', jobBody)
  let counter = 0
  return new Promise((resolve, reject) => {
    if (!waitForFinish) resolve({})
    const interval = setInterval(async () => {
      counter++

      const job = await app.service(apiJobPath).get(jobId)
      console.log('job to be checked on', job, job.status)
      if (job.status !== 'pending') clearInterval(interval)
      if (job.status === 'succeeded') resolve(job.returnData)
      if (job.status === 'failed') reject()
      if (counter >= timeout) {
        clearInterval(interval)
        const date = await getDateTimeSql()
        await app.service(apiJobPath).patch(jobId, {
          status: 'failed',
          endTime: date
        })
        reject('Job timed out; try again later or check error logs of job')
      }
    }, 1000)
  })
}

export async function getJobBody(
  app: Application,
  command: string[],
  name: string,
  labels: { [key: string]: string },
  ttlSecondsAfterFinished = 86400 // This value is 1 day
): Promise<k8s.V1Job> {
  const apiPods = await getPodsData(
    `app.kubernetes.io/instance=${config.server.releaseName},app.kubernetes.io/component=api`,
    'api',
    'Api',
    app
  )

  const image = apiPods.pods[0].containers.find((container) => container.name === 'xrengine')!.image

  // Add this label to the job so that we can identify pods for a job
  labels['xrengine/isJob'] = 'true'

  return {
    metadata: {
      name,
      labels
    },
    spec: {
      ttlSecondsAfterFinished,
      template: {
        metadata: {
          labels
        },
        spec: {
          serviceAccountName: `${process.env.RELEASE_NAME}-xrengine-api`,
          containers: [
            {
              name,
              image,
              imagePullPolicy: 'IfNotPresent',
              command,
              env: Object.entries(process.env).map(([key, value]) => {
                return { name: key, value: value }
              })
            }
          ],
          restartPolicy: 'Never'
        }
      }
    }
  }
}
