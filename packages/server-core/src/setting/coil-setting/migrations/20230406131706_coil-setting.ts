import type { Knex } from 'knex'

import { coilSettingPath } from '@xrengine/common/src/schemas/setting/coil-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'coilSetting'

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  if (oldNamedTableExists) {
    await knex.schema.renameTable(oldTableName, coilSettingPath)
  }

  const tableExists = await knex.schema.hasTable(coilSettingPath)

  if (tableExists === false) {
    await knex.schema.createTable(coilSettingPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('paymentPointer', 255).nullable()
      table.string('clientId', 255).nullable()
      table.string('clientSecret', 255).nullable()
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

  const tableExists = await knex.schema.hasTable(coilSettingPath)

  if (tableExists === true) {
    await knex.schema.dropTable(coilSettingPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
