
import type { Knex } from 'knex'

import { awsSettingPath } from '@xrengine/common/src/schemas/setting/aws-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'Aws'

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  if (oldNamedTableExists) {
    await knex.schema.renameTable(oldTableName, awsSettingPath)
  }

  const tableExists = await knex.schema.hasTable(awsSettingPath)

  if (tableExists === false) {
    await knex.schema.createTable(awsSettingPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.json('keys').nullable()
      table.json('s3').nullable()
      table.json('cloudfront').nullable()
      table.json('sms').nullable()
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

  const tableExists = await knex.schema.hasTable(awsSettingPath)

  if (tableExists === true) {
    await knex.schema.dropTable(awsSettingPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
