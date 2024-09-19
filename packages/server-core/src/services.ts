import fs from 'fs'
import path from 'path'

import { ProjectConfigInterface } from '@xrengine/projects/ProjectConfigInterface'

import { Application } from '../declarations'
import AnalyticsServices from './analytics/services'
import AssetServices from './assets/services'
import BotService from './bot/services'
import ClusterServices from './cluster/services'
import IntegrationServices from './integrations/services'
import MatchMakingServices from './matchmaking/services'
import MediaServices from './media/services'
import NetworkingServices from './networking/services'
import EntityServices from './projects/services'
import RecordingServices from './recording/services'
import RouteService from './route/service'
import ScopeService from './scope/service'
import SettingService from './setting/service'
import SocialServices from './social/services'
import UserServices from './user/services'
import WorldServices from './world/services'

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
          if (!config.services) return null
          return path.join(projectName, config.services)
        } catch (e) {
          // console.log(e)
        }
      })
      .filter((hasServices) => !!hasServices)
      .map((servicesDir) => {
        return require(`../../projects/projects/${servicesDir}`).default as (app: Application) => void
      })
      .flat()
  : []

export default (app: Application): void => {
  ;[
    ...ClusterServices,
    ...AnalyticsServices,
    ...UserServices,
    ...AssetServices,
    ...MediaServices,
    ...EntityServices,
    ...NetworkingServices,
    ...SocialServices,
    ...BotService,
    ...ScopeService,
    ...SettingService,
    ...RouteService,
    ...RecordingServices,
    ...MatchMakingServices,
    ...WorldServices,
    ...IntegrationServices
  ]
    .concat(...installedProjects)
    .forEach((service) => {
      app.configure(service)
    })
}
