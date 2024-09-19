import type { Knex } from 'knex'

import { authenticationSettingPath } from '@xrengine/common/src/schemas/setting/authentication-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const authSettings = await knex.table(authenticationSettingPath).first()

  if (authSettings) {
    const oauthSettings = JSON.parse(authSettings.oauth)
    oauthSettings.linkedin.scope = ['profile', 'email']

    await knex.table(authenticationSettingPath).update({
      oauth: JSON.stringify(oauthSettings)
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
