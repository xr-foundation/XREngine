
import { mailchimpSettingPath } from '@xrengine/common/src/schemas/setting/mailchimp-setting.schema'
import { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(mailchimpSettingPath)

  if (!tableExists) {
    await knex.schema.createTable(mailchimpSettingPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('key', 255).nullable()
      table.string('server', 255).nullable()
      table.string('audienceId', 255).nullable()
      table.string('defaultTags', 255).nullable()
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

  const tableExists = await knex.schema.hasTable(mailchimpSettingPath)

  if (tableExists) {
    await knex.schema.dropTable(mailchimpSettingPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
