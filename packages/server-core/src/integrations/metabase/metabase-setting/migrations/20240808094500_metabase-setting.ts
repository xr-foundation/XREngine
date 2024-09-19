
import { metabaseSettingPath } from '@xrengine/common/src/schemas/integrations/metabase/metabase-setting.schema'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(metabaseSettingPath)

  if (!tableExists) {
    await knex.schema.createTable(metabaseSettingPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('siteUrl', 255).nullable()
      table.string('secretKey', 255).nullable()
      table.string('crashDashboardId', 255).nullable()
      table.integer('expiration').defaultTo(10)
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(metabaseSettingPath)

  if (tableExists === true) {
    await knex.schema.dropTable(metabaseSettingPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
