import { serverSettingPath } from '@xrengine/common/src/schemas/setting/server-setting.schema'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const gaTrackingIdColumnExists = await knex.schema.hasColumn(serverSettingPath, 'gaTrackingId')

  if (gaTrackingIdColumnExists === true) {
    await knex.schema.alterTable(serverSettingPath, async (table) => {
      table.dropColumn('gaTrackingId')
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const gaTrackingIdColumnExists = await knex.schema.hasColumn(serverSettingPath, 'gaTrackingId')

  if (gaTrackingIdColumnExists === false) {
    await knex.schema.alterTable(serverSettingPath, async (table) => {
      table.string('gaTrackingId', 255).nullable()
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
