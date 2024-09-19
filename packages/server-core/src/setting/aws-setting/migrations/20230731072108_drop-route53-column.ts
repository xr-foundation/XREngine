
import type { Knex } from 'knex'

import { awsSettingPath } from '@xrengine/common/src/schemas/setting/aws-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const route53ColumnExists = await knex.schema.hasColumn(awsSettingPath, 'route53')

  if (route53ColumnExists) {
    await knex.schema.alterTable(awsSettingPath, async (table) => {
      table.dropColumn('route53')
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const route53ColumnExists = await knex.schema.hasColumn(awsSettingPath, 'route53')

  if (!route53ColumnExists) {
    await knex.schema.alterTable(awsSettingPath, async (table) => {
      table.json('route53').nullable()
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
