
import type { Knex } from 'knex'

import { awsSettingPath } from '@xrengine/common/src/schemas/setting/aws-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const eksColumnExists = await knex.schema.hasColumn(awsSettingPath, 'eks')
  if (!eksColumnExists) {
    await knex.schema.alterTable(awsSettingPath, async (table) => {
      table.json('eks').nullable()
    })
    await knex.table(awsSettingPath).update({
      eks: JSON.stringify({
        accessKeyId: process.env.EKS_AWS_ACCESS_KEY_ID || process.env.EKS_AWS_ACCESS_KEY || process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.EKS_AWS_ACCESS_KEY_SECRET || process.env.EKS_AWS_SECRET || process.env.AWS_SECRET
      })
    })
  }
  const keysColumnExists = await knex.schema.hasColumn(awsSettingPath, 'keys')
  if (keysColumnExists) {
    const awsSettings = await knex.table(awsSettingPath).first()
    if (!awsSettings) return
    let keys = JSON.parse(awsSettings.keys)
    if (typeof keys === 'string') keys = JSON.parse(keys)
    let s3 = JSON.parse(awsSettings.s3)
    if (typeof s3 === 'string') s3 = JSON.parse(s3)
    s3.accessKeyId = keys.accessKeyId
    s3.secretAccessKey = keys.secretAccessKey
    await knex.table(awsSettingPath).update({
      s3: JSON.stringify(s3)
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const eksColumnExists = await knex.schema.hasColumn(awsSettingPath, 'eks')

  if (eksColumnExists === true) {
    await knex.schema.alterTable(awsSettingPath, async (table) => {
      table.dropColumn('eks')
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
