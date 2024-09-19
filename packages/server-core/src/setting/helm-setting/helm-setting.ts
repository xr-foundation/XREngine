import fetch from 'node-fetch'
import semver from 'semver'

import {
  helmBuilderVersionPath,
  helmMainVersionPath,
  helmSettingMethods,
  helmSettingPath
} from '@xrengine/common/src/schemas/setting/helm-setting.schema'

import { Application } from '../../../declarations'
import { updateAppConfig } from '../../updateAppConfig'
import { HelmSettingService } from './helm-setting.class'
import helmSettingDocs from './helm-setting.docs'
import hooks from './helm-setting.hooks'

import { BUILDER_CHART_REGEX, MAIN_CHART_REGEX } from '@xrengine/common/src/regex'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    [helmSettingPath]: HelmSettingService
    [helmMainVersionPath]: { find: () => Promise<string[]> }
    [helmBuilderVersionPath]: { find: () => Promise<string[]> }
  }
}

export default (app: Application): void => {
  const options = {
    name: helmSettingPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(helmSettingPath, new HelmSettingService(options), {
    // A list of all methods this service exposes externally
    methods: helmSettingMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: helmSettingDocs
  })

  const service = app.service(helmSettingPath)
  service.hooks(hooks)

  service.on('patched', () => {
    updateAppConfig()
  })

  app.use(helmMainVersionPath, {
    find: async () => {
      const versions: string[] = []
      const response = await fetch('https://helm.xrfoundation.org')
      const chart = Buffer.from(await response.arrayBuffer()).toString()

      const matches = chart.matchAll(MAIN_CHART_REGEX)
      for (const match of matches) {
        if (match) {
          //Need 5.1.3 or greater for API servers to have required cluster roles to run helm upgrade
          if (versions.indexOf(match[1]) < 0 && semver.gte(match[1], '5.1.3')) versions.push(match[1])
        }
      }
      return versions
    }
  })

  app.use(helmBuilderVersionPath, {
    find: async () => {
      const versions: string[] = []
      const response = await fetch('https://helm.xrfoundation.org')
      const chart = Buffer.from(await response.arrayBuffer()).toString()

      const matches = chart.matchAll(BUILDER_CHART_REGEX)

      for (const match of matches) {
        if (match && versions.indexOf(match[1]) < 0) {
          versions.push(match[1])
        }
      }
      return versions
    }
  })
}
