import { clientSettingPath } from '@xrengine/common/src/schemas/setting/client-setting.schema'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const gaMeasurementIdColumnExists = await knex.schema.hasColumn(clientSettingPath, 'gaMeasurementId')

  if (gaMeasurementIdColumnExists === false) {
    await knex.schema.alterTable(clientSettingPath, async (table) => {
      table.string('gaMeasurementId').nullable()
    })

    const clientSettings = await knex.table(clientSettingPath).first()

    if (clientSettings) {
      await knex.table(clientSettingPath).update({
        gaMeasurementId: process.env.GOOGLE_ANALYTICS_MEASUREMENT_ID
      })
    }
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const gaMeasurementIdColumnExists = await knex.schema.hasColumn(clientSettingPath, 'gaMeasurementId')

  if (gaMeasurementIdColumnExists === true) {
    await knex.schema.alterTable(clientSettingPath, async (table) => {
      table.dropColumn('gaMeasurementId')
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
