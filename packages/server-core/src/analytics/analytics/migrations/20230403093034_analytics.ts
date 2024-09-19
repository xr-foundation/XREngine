import type { Knex } from 'knex'

import { analyticsPath } from '@xrengine/common/src/schemas/analytics/analytics.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(analyticsPath)

  if (tableExists === false) {
    await knex.schema.createTable(analyticsPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.integer('count').nullable()
      table.string('type', 255).nullable()
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

  const tableExists = await knex.schema.hasTable(analyticsPath)

  if (tableExists === true) {
    await knex.schema.dropTable(analyticsPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
