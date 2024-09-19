
import type { Knex } from 'knex'

import { authenticationSettingPath } from '@xrengine/common/src/schemas/setting/authentication-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(authenticationSettingPath, async (table) => {
    table.string('secret', 4095).nullable().alter()
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
