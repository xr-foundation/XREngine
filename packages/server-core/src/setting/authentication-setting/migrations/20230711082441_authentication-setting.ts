import type { Knex } from 'knex'

import { authenticationSettingPath } from '@xrengine/common/src/schemas/setting/authentication-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'authentication'

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  if (oldNamedTableExists) {
    await knex.schema.renameTable(oldTableName, authenticationSettingPath)
  }

  const tableExists = await knex.schema.hasTable(authenticationSettingPath)

  if (tableExists === false) {
    await knex.schema.createTable(authenticationSettingPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('service', 255).nullable()
      table.string('entity', 255).nullable()
      table.string('secret', 255).nullable()
      table.json('authStrategies').nullable()
      table.json('jwtOptions').nullable()
      table.json('bearerToken').nullable()
      table.json('callback').nullable()
      table.json('oauth').nullable()
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

  const tableExists = await knex.schema.hasTable(authenticationSettingPath)

  if (tableExists === true) {
    await knex.schema.dropTable(authenticationSettingPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
