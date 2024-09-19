
import { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

import { defaultMediaSettings } from '@xrengine/common/src/constants/DefaultMediaSettings'
import { defaultThemeModes, defaultThemeSettings } from '@xrengine/common/src/constants/DefaultThemeSettings'
import {
  ClientSettingDatabaseType,
  clientSettingPath
} from '@xrengine/common/src/schemas/setting/client-setting.schema'
import { getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import appConfig from '@xrengine/server-core/src/appconfig'

export const clientSettingSeedData = {
  logo: process.env.APP_LOGO || '',
  title: process.env.APP_TITLE || '',
  shortTitle: process.env.APP_TITLE || '',
  startPath: '/',
  releaseName: process.env.RELEASE_NAME || 'local',
  siteDescription: process.env.SITE_DESC || 'XREngine',
  url:
    process.env.APP_URL ||
    (process.env.VITE_LOCAL_BUILD
      ? 'http://' + process.env.APP_HOST + ':' + process.env.APP_PORT
      : 'https://' + process.env.APP_HOST + ':' + process.env.APP_PORT),
  appleTouchIcon: 'apple-touch-icon.png',
  favicon32px: '/favicon-32x32.png',
  favicon16px: '/favicon-16x16.png',
  icon192px: '/android-chrome-192x192.png',
  icon512px: '/android-chrome-512x512.png',
  siteManifest: '/site.webmanifest',
  safariPinnedTab: '/safari-pinned-tab.svg',
  favicon: '/favicon.ico',
  appBackground: 'static/main-background.png',
  appTitle: 'static/xrengine-logo.svg',
  appSubtitle: 'XREngine',
  appDescription: 'FREE, OPEN, & INTEROPERABLE IMMERSIVE WEB TECHNOLOGY',
  gaMeasurementId: process.env.GOOGLE_ANALYTICS_MEASUREMENT_ID || '',
  gtmContainerId: process.env.GOOGLE_TAG_MANAGER_CONTAINER_ID || '',
  gtmAuth: process.env.GOOGLE_TAG_MANAGER_AUTH || '',
  gtmPreview: process.env.GOOGLE_TAG_MANAGER_PREVIEW || '',
  appSocialLinks: JSON.stringify([
    { icon: 'static/discord.svg', link: 'https://discord.gg/xrfoundation' },
    { icon: 'static/github.svg', link: 'https://github.com/xr-foundation' }
  ]),
  themeSettings: JSON.stringify(defaultThemeSettings),
  themeModes: JSON.stringify(defaultThemeModes),
  key8thWall: process.env.VITE_8TH_WALL || '',
  privacyPolicy: 'https://www.xrfoundation.org/privacy-policy',
  homepageLinkButtonEnabled: false,
  homepageLinkButtonRedirect: '',
  homepageLinkButtonText: '',
  webmanifestLink: '',
  swScriptLink: '',
  mediaSettings: defaultMediaSettings
}

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: ClientSettingDatabaseType[] = await Promise.all(
    [clientSettingSeedData].map(async (item) => ({
      ...item,
      id: uuidv4(),
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }))
  )

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(clientSettingPath).del()

    // Inserts seed entries
    await knex(clientSettingPath).insert(seedData)
  } else {
    const existingData = await knex(clientSettingPath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(clientSettingPath).insert(item)
      }
    }
  }
}
