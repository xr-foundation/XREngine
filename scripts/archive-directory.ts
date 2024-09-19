
import appRootPath from 'app-root-path'
import cli from 'cli'
import dotenv from 'dotenv-flow'

import { archiverPath } from '@xrengine/common/src/schema.type.module'
import { createFeathersKoaApp, serverJobPipe } from '@xrengine/server-core/src/createApp'
import { ServerMode } from '@xrengine/server-core/src/ServerState'

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
  project: [false, 'Project to archive', 'string'],
  jobId: [false, 'ID of Job record', 'string']
})

cli.main(async () => {
  try {
    const app = createFeathersKoaApp(ServerMode.API, serverJobPipe)
    await app.setup()
    const { project, jobId } = options
    await app.service(archiverPath).get(null, {
      query: { isJob: true, project, jobId }
    })
    cli.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
