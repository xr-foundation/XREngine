import appRootPath from 'app-root-path'
import cli from 'cli'
import dotenv from 'dotenv-flow'

import { transformModel } from '@xrengine/common/src/model/ModelTransformFunctions'
import { argsToObject } from '@xrengine/common/src/utils/objectToCommandLineArgs'
import { ModelTransformParameters } from '@xrengine/engine/src/assets/classes/ModelTransform'
import { ServerMode } from '@xrengine/server-core/src/ServerState'
import { createFeathersKoaApp, serverJobPipe } from '@xrengine/server-core/src/createApp'

const modelTransformParameters: ModelTransformParameters = argsToObject(process.argv.slice(3))

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

cli.main(async () => {
  try {
    const app = createFeathersKoaApp(ServerMode.API, serverJobPipe)
    await app.setup()
    await transformModel(modelTransformParameters)
    cli.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
