


import type { Knex } from 'knex'

import { instanceServerSettingPath } from '@xrengine/common/src/schemas/setting/instance-server-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const webRTCSettingsColumn = await knex.table(instanceServerSettingPath).first()
  if (webRTCSettingsColumn) {
    const webRTCSettings = JSON.parse(webRTCSettingsColumn.webRTCSettings)
    const iceServers = webRTCSettings.iceServers
    if (iceServers.length > 0) {
      iceServers.forEach((iceServer, index) => {
        iceServer.useFixedCredentials = iceServer.username != null || iceServer.credential != null
        if (index === 0) {
          iceServer.useTimeLimitedCredentials = webRTCSettings.useTimeLimitedCredentials
          if (webRTCSettings.webRTCStaticAuthSecretKey)
            iceServer.webRTCStaticAuthSecretKey = webRTCSettings.webRTCStaticAuthSecretKey
        }
      })
    }
    delete webRTCSettings.webRTCStaticAuthSecretKey
    delete webRTCSettings.useTimeLimitedCredentials
    await knex.table(instanceServerSettingPath).update({
      webRTCSettings: JSON.stringify(webRTCSettings)
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const webRTCSettingsColumn = await knex.table(instanceServerSettingPath).first()
  const webRTCSettings = JSON.parse(webRTCSettingsColumn.webRTCSettings)
  const iceServers = webRTCSettings.iceServers
  if (iceServers.length > 0) {
    iceServers.forEach((iceServer, index) => {
      delete iceServer.useFixedCredentials
      if (index === 0) {
        webRTCSettings.useTimeLimitedCredentials = iceServer.useTimeLimitedCredentials
        delete iceServer.useTimeLimitedCredentials
        if (iceServer.webRTCStaticAuthSecretKey) {
          webRTCSettings.webRTCStaticAuthSecretKey = iceServer.webRTCStaticAuthSecretKey
          delete iceServer.webRTCStaticAuthSecretKey
        }
      }
    })
  }
  await knex.table(instanceServerSettingPath).update({
    webRTCSettings: JSON.stringify(webRTCSettings)
  })
}
