import appRootPath from 'app-root-path'
import cli from 'cli'
import dotenv from 'dotenv-flow'

import { projectPath, ProjectType } from '@xrengine/common/src/schema.type.module'
import { getState } from '@xrengine/hyperflux'
import { createFeathersKoaApp, serverJobPipe } from '@xrengine/server-core/src/createApp'
import { getCronJobBody } from '@xrengine/server-core/src/projects/project/project-helper'
import { ServerMode, ServerState } from '@xrengine/server-core/src/ServerState'

dotenv.config({
  path: appRootPath.path,
  silent: true
})

const db = {
  username: process.env.MYSQL_USER ?? 'server',
  password: process.env.MYSQL_PASSWORD ?? 'password',
  database: process.env.MYSQL_DATABASE ?? 'xrengine',
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: process.env.MYSQL_PORT ?? 3306,
  dialect: 'mysql',
  url: ''
}

db.url = process.env.MYSQL_URL ?? `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`

cli.enable('status')

const options = cli.parse({
  repoName: [false, 'Name of repo', 'string'],
  tag: [false, 'Commit Tag', 'string'],
  repoUrl: [false, 'Docker repository', 'string'],
  startTime: [false, 'Timestamp of image', 'string']
})

cli.main(async () => {
  try {
    const app = createFeathersKoaApp(ServerMode.API, serverJobPipe)
    await app.setup()
    const autoUpdateProjects = (await app.service(projectPath).find({
      query: {
        action: 'admin',
        $or: [
          {
            updateType: 'commit'
          },
          {
            updateType: 'tag'
          }
        ]
      },
      paginate: false
    })) as ProjectType[]
    const k8BatchClient = getState(ServerState).k8BatchClient
    if (k8BatchClient)
      for (const project of autoUpdateProjects) {
        try {
          await k8BatchClient.patchNamespacedCronJob(
            `${process.env.RELEASE_NAME}-${project.name}-auto-update`,
            'default',
            getCronJobBody(project, `${options.repoUrl}/${options.repoName}-api:${options.tag}__${options.startTime}`),
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            {
              headers: {
                'content-type': 'application/merge-patch+json'
              }
            }
          )
        } catch (err) {
          await k8BatchClient.createNamespacedCronJob(
            'default',
            getCronJobBody(project, `${options.repoUrl}/${options.repoName}-api:${options.tag}__${options.startTime}`)
          )
        }
      }
    cli.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
