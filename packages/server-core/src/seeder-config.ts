
import fs from 'fs'
import path from 'path'

import { KnexSeed } from '@xrengine/common/src/interfaces/KnexSeed'
import { ProjectConfigInterface } from '@xrengine/projects/ProjectConfigInterface'

import { analyticsSeeds } from './analytics/seeder-config'
import { integrationsSeeds } from './integrations/seeder-config'
import { mediaSeeds } from './media/seeder-config'
import { networkingSeeds } from './networking/seeder-config'
import { projectSeeds } from './projects/seeder-config'
import { routeSeeds } from './route/seeder-config'
import { scopeSeeds } from './scope/seeder-config'
import { settingSeeds } from './setting/seeder-config'
import { socialSeeds } from './social/seeder-config'
import { userSeeds } from './user/seeder-config'

const installedProjects = fs.existsSync(path.resolve(__dirname, '../../projects/projects'))
  ? fs
      .readdirSync(path.resolve(__dirname, '../../projects/projects'), { withFileTypes: true })
      .filter((orgDir) => orgDir.isDirectory())
      .map((orgDir) => {
        return fs
          .readdirSync(path.resolve(__dirname, '../../projects/projects', orgDir.name), { withFileTypes: true })
          .filter((projectDir) => projectDir.isDirectory())
          .map((projectDir) => `${orgDir.name}/${projectDir.name}`)
      })
      .flat()
      .map((projectName) => {
        try {
          const configPath = `../../projects/projects/${projectName}/xrengine.config.ts`
          const config: ProjectConfigInterface = require(configPath).default
          if (!config.databaseSeed) return null
          return path.join(projectName, config.databaseSeed)
        } catch (e) {
          // console.log(e)
        }
      })
      .filter((hasServices) => !!hasServices)
      .map((seedDir) => require(`../../projects/projects/${seedDir}`).default)
      .flat()
  : []

export const knexSeeds: Array<KnexSeed> = [
  ...routeSeeds,
  ...analyticsSeeds,
  ...settingSeeds,
  ...scopeSeeds,
  ...userSeeds,
  ...socialSeeds,
  ...projectSeeds,
  ...mediaSeeds,
  ...networkingSeeds,
  ...integrationsSeeds,
  ...installedProjects
]
