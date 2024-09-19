
import appRootPath from 'app-root-path'
import cli from 'cli'
import dotenv from 'dotenv-flow'

import { invalidationPath } from '@xrengine/common/src/schema.type.module'
import { createFeathersKoaApp, serverJobPipe } from '@xrengine/server-core/src/createApp'
import { getStorageProvider } from '@xrengine/server-core/src/media/storageprovider/storageprovider'
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
  repoName: [false, 'Name of repo', 'string'],
  tag: [false, 'Commit Tag', 'string'],
  repoUrl: [false, 'Docker repository', 'string'],
  startTime: [false, 'Timestamp of image', 'string']
})

const encodeCloudfrontInvalidation = (uri: string) =>
  encodeURI(
    uri
      .replaceAll('%', '%25')
      .replaceAll(' ', '+')
      .replaceAll('"', '%22')
      .replaceAll('#', '%23')
      .replaceAll('<', '%3C')
      .replaceAll('>', '%3E')
      .replaceAll('[', '%5B')
      .replaceAll('\\', '%5C')
      .replaceAll(']', '%5D')
      .replaceAll('^', '%5E')
      .replaceAll('`', `%60`)
      .replaceAll('{', '%7B')
      .replaceAll('|', '%7C')
      .replaceAll('}', '%7D')
      .replaceAll('~', '%7E')
      .replaceAll("'", '%27')
  )

cli.main(async () => {
  try {
    const app = createFeathersKoaApp(ServerMode.API, serverJobPipe)
    await app.setup()
    const invalidations = await app.service(invalidationPath).find({
      query: {
        $limit: 3000,
        $sort: {
          createdAt: 1
        }
      },
      paginate: false
    })
    if (invalidations.length > 0) {
      let pathArray: string[] = []
      let idArray: string[] = []
      let numWildcards = 0

      for (let invalidation of invalidations) {
        const isWildcard = invalidation.path.match(/\*/)
        if (isWildcard && numWildcards > 5) continue
        pathArray.push(encodeCloudfrontInvalidation(invalidation.path))
        idArray.push(invalidation.id)
        if (isWildcard) numWildcards++
      }

      pathArray = [...new Set(pathArray)]
      const storageProvider = getStorageProvider()
      await storageProvider.createInvalidation(pathArray)
      await app.service(invalidationPath).remove(null, {
        query: {
          id: {
            $in: idArray
          }
        }
      })
    }
    cli.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
