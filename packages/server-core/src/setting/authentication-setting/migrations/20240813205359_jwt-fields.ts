import type { Knex } from 'knex'

import { authenticationSettingPath } from '@xrengine/common/src/schemas/setting/authentication-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const jwtAlgorithmColumnExists = await knex.schema.hasColumn(authenticationSettingPath, 'jwtAlgorithm')
  const jwtPublicKeyColumnExists = await knex.schema.hasColumn(authenticationSettingPath, 'jwtPublicKey')
  if (!jwtPublicKeyColumnExists || !jwtAlgorithmColumnExists)
    await knex.schema.alterTable(authenticationSettingPath, async (table) => {
      if (!jwtAlgorithmColumnExists) table.string('jwtAlgorithm').defaultTo('HS256')
      if (!jwtPublicKeyColumnExists) table.string('jwtPublicKey', 1023).nullable()
    })

  const authSettings = await knex.table(authenticationSettingPath).first()

  if (authSettings && (process.env.JWT_ALGORITHM || process.env.JWT_PUBLIC_KEY)) {
    const data = {} as any
    if (process.env.JWT_ALGORITHM) data.jwtAlgorithm = process.env.JWT_ALGORITHM
    if (process.env.JWT_PUBLIC_KEY) data.jwtPublicKey = process.env.JWT_PUBLIC_KEY
    await knex.table(authenticationSettingPath).update(data)
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(authenticationSettingPath, async (table) => {
    table.dropColumn('jwtAlgorithm')
    table.dropColumn('jwtPublicKey')
  })
}
