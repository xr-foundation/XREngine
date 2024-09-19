import type { Knex } from 'knex'

import { userSettingPath } from '@xrengine/common/src/schemas/user/user-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'user_settings'

  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210

  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  let tableExists = await knex.schema.hasTable(userSettingPath)
  if (oldNamedTableExists) {
    // In case sequelize creates the new table before we migrate the old table
    if (tableExists) await knex.schema.dropTable(userSettingPath)
    await knex.schema.renameTable(oldTableName, userSettingPath)
  }

  tableExists = await knex.schema.hasTable(userSettingPath)

  if (!tableExists && !oldNamedTableExists) {
    await knex.schema.createTable(userSettingPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.json('themeModes').nullable()
      //@ts-ignore
      table.uuid('userId', 36).collate('utf8mb4_bin').index().nullable()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.foreign('userId').references('id').inTable('user').onDelete('CASCADE').onUpdate('CASCADE')
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

  const tableExists = await knex.schema.hasTable(userSettingPath)

  if (tableExists === true) {
    await knex.schema.dropTable(userSettingPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
