
import appRootPath from 'app-root-path'
import { exec } from 'child_process'
import cli from 'cli'
import dotenv from 'dotenv-flow'
import fs from 'fs'
import knex from 'knex'
import path from 'path'
import { promisify } from 'util'

import { BUILDER_CHART_REGEX, MAIN_CHART_REGEX } from '@xrengine/common/src/regex'
import { HelmSettingType, helmSettingPath } from '@xrengine/common/src/schema.type.module'

dotenv.config({
  path: appRootPath.path,
  silent: true
})

const execAsync = promisify(exec)

cli.enable('status')

const options = cli.parse({
  stage: [true, 'dev, prod, etc; deployment stage', 'string']
})

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

    const [helmSettings] = await knexClient.select().from<HelmSettingType>(helmSettingPath)

    const helmMainVersionName = path.join(appRootPath.path, 'helm-main-version.txt')
    const helmBuilderVersionName = path.join(appRootPath.path, 'helm-builder-version.txt')

    if (helmSettings) {
      if (helmSettings.main && helmSettings.main.length > 0) fs.writeFileSync(helmMainVersionName, helmSettings.main)
      else {
        const { stdout } = await execAsync(`helm history ${options.stage} | grep deployed`)
        const matches = stdout.matchAll(MAIN_CHART_REGEX)
        for (const match of matches) {
          const mainChartVersion = match[1]
          if (mainChartVersion) {
            fs.writeFileSync(helmMainVersionName, mainChartVersion)
          }
        }
      }
      if (helmSettings.builder && helmSettings.builder.length > 0)
        fs.writeFileSync(helmBuilderVersionName, helmSettings.builder)
      else {
        const { stdout } = await execAsync(`helm history ${options.stage}-builder | grep deployed`)
        const matches = stdout.matchAll(BUILDER_CHART_REGEX)
        for (const match of matches) {
          const builderChartVersion = match[1]
          if (builderChartVersion) {
            fs.writeFileSync(helmBuilderVersionName, builderChartVersion)
          }
        }
      }
    } else {
      const { stdout } = await execAsync(`helm history ${options.stage} | grep deployed`)

      const mainChartMatches = stdout.matchAll(MAIN_CHART_REGEX)
      for (const match of mainChartMatches) {
        const mainChartVersion = match[1]
        if (mainChartVersion) {
          fs.writeFileSync(helmMainVersionName, mainChartVersion)
        }
      }

      const builderChartMatches = stdout.matchAll(MAIN_CHART_REGEX)
      for (const match of builderChartMatches) {
        const builderChartVersion = match[1]
        if (builderChartVersion) {
          fs.writeFileSync(helmBuilderVersionName, builderChartVersion)
        }
      }
    }
    cli.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
