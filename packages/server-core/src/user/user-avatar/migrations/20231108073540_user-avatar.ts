
import type { Knex } from 'knex'

import { userAvatarPath } from '@xrengine/common/src/schemas/user/user-avatar.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(userAvatarPath)

  if (tableExists === false) {
    await knex.schema.createTable(userAvatarPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      //@ts-ignore
      table.uuid('userId', 36).collate('utf8mb4_bin').nullable().index()
      //@ts-ignore
      table.uuid('avatarId', 36).collate('utf8mb4_bin').nullable().index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.foreign('userId').references('id').inTable('user').onDelete('CASCADE').onUpdate('CASCADE')
      table.foreign('avatarId').references('id').inTable('avatar').onDelete('CASCADE').onUpdate('CASCADE')
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

  const tableExists = await knex.schema.hasTable(userAvatarPath)

  if (tableExists === true) {
    await knex.schema.dropTable(userAvatarPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
