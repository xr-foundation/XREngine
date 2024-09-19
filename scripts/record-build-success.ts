
import appRootPath from 'app-root-path'
import cli from 'cli'
import dotenv from 'dotenv-flow'
import fs from 'fs'
import knex from 'knex'

import { buildStatusPath, BuildStatusType } from '@xrengine/common/src/schema.type.module'

dotenv.config({
  path: appRootPath.path,
  silent: true
})

cli.enable('status')

cli.main(async () => {
  try {
    const knexClient = knex({
      client: 'mysql',
      connection: {
        user: process.env.MYSQL_USER ?? 'server',
        password: process.env.MYSQL_PASSWORD ?? 'password',
        host: process.env.MYSQL_HOST ?? '127.0.0.1',
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        database: process.env.MYSQL_DATABASE ?? 'xrengine',
        charset: 'utf8mb4'
      }
    })

    const dateNow = new Date().toISOString().slice(0, 19).replace('T', ' ')

    const builderRun = fs.readFileSync('builder-run.txt').toString()
    await knexClient
      .from<BuildStatusType>(buildStatusPath)
      .where({
        id: parseInt(builderRun)
      })
      .update({
        status: 'success',
        dateEnded: dateNow
      })
    cli.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
