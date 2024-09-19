import type { Knex } from 'knex'

import { routePath } from '@xrengine/common/src/schemas/route/route.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(routePath)

  if (tableExists === false) {
    await knex.schema.createTable(routePath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('project', 255).nullable()
      table.string('route', 255).nullable()
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

  const tableExists = await knex.schema.hasTable(routePath)

  if (tableExists === true) {
    await knex.schema.dropTable(routePath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
