
import { clientSettingPath } from '@xrengine/common/src/schemas/setting/client-setting.schema'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const gtmContainerId = await knex.schema.hasColumn(clientSettingPath, 'gtmContainerId')
  const gtmAuth = await knex.schema.hasColumn(clientSettingPath, 'gtmAuth')
  const gtmPreview = await knex.schema.hasColumn(clientSettingPath, 'gtmPreview')

  if (!gtmContainerId || !gtmAuth || !gtmPreview) {
    await knex.schema.alterTable(clientSettingPath, async (table) => {
      table.string('gtmContainerId').nullable()
      table.string('gtmAuth').nullable()
      table.string('gtmPreview').nullable()
    })

    const clientSettings = await knex.table(clientSettingPath).first()

    if (clientSettings && process.env.GOOGLE_TAG_MANAGER_CONTAINER_ID) {
      await knex.table(clientSettingPath).update({
        gtmContainerId: process.env.GOOGLE_TAG_MANAGER_CONTAINER_ID,
        gtmAuth: process.env.GOOGLE_TAG_MANAGER_AUTH ?? '',
        gtmPreview: process.env.GOOGLE_TAG_MANAGER_PREVIEW ?? ''
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

  const gtmContainerId = await knex.schema.hasColumn(clientSettingPath, 'gtmContainerId')

  if (gtmContainerId) {
    await knex.schema.alterTable(clientSettingPath, async (table) => {
      table.dropColumn('gtmContainerId')
      table.dropColumn('gtmAuth')
      table.dropColumn('gtmPreview')
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
