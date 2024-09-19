import type { Knex } from 'knex'

import { defaultWebRTCSettings } from '@xrengine/common/src/constants/DefaultWebRTCSettings'
import { instanceServerSettingPath } from '@xrengine/common/src/schemas/setting/instance-server-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const webRTCSettingsColumnExists = await knex.schema.hasColumn(instanceServerSettingPath, 'webRTCSettings')
  if (!webRTCSettingsColumnExists) {
    await knex.schema.alterTable(instanceServerSettingPath, async (table) => {
      table.json('webRTCSettings')
    })
    await knex.table(instanceServerSettingPath).update({
      webRTCSettings: JSON.stringify(defaultWebRTCSettings)
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const webRTCSettingsColumnExists = await knex.schema.hasColumn(instanceServerSettingPath, 'webRTCSettings')

  if (webRTCSettingsColumnExists) {
    await knex.schema.alterTable(instanceServerSettingPath, async (table) => {
      table.dropColumn('webRTCSettings')
    })
  }
}
