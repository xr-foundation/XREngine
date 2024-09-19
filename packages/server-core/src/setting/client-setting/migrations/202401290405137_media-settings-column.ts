import type { Knex } from 'knex'

import { defaultMediaSettings } from '@xrengine/common/src/constants/DefaultMediaSettings'
import { clientSettingPath } from '@xrengine/common/src/schemas/setting/client-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const mediaSettingsColumnExists = await knex.schema.hasColumn(clientSettingPath, 'mediaSettings')
  if (!mediaSettingsColumnExists) {
    await knex.schema.alterTable(clientSettingPath, async (table) => {
      table.json('mediaSettings')
    })
    await knex.table(clientSettingPath).update({
      mediaSettings: JSON.stringify(defaultMediaSettings)
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const mediaSettingsColumnExists = await knex.schema.hasColumn(clientSettingPath, 'mediaSettings')

  if (mediaSettingsColumnExists) {
    await knex.schema.alterTable(clientSettingPath, async (table) => {
      table.dropColumn('mediaSettings')
    })
  }
}
