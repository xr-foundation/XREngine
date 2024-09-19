
import type { Knex } from 'knex'

import { clientSettingPath } from '@xrengine/common/src/schemas/setting/client-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const privacyPolicyColumnExists = await knex.schema.hasColumn(clientSettingPath, 'privacyPolicy')
  if (!privacyPolicyColumnExists) {
    await knex.schema.alterTable(clientSettingPath, async (table) => {
      table.string('privacyPolicy')
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const privacyPolicyColumnExists = await knex.schema.hasColumn(clientSettingPath, 'privacyPolicy')

  if (privacyPolicyColumnExists) {
    await knex.schema.alterTable(clientSettingPath, async (table) => {
      table.dropColumn('privacyPolicy')
    })
  }
}
