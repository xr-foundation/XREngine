import type { Knex } from 'knex'

import { helmSettingPath } from '@xrengine/common/src/schemas/setting/helm-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(helmSettingPath)

  if (tableExists === false) {
    await knex.schema.createTable(helmSettingPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('main', 255).nullable()
      table.string('builder', 255).nullable()
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

  const tableExists = await knex.schema.hasTable(helmSettingPath)

  if (tableExists === true) {
    await knex.schema.dropTable(helmSettingPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
