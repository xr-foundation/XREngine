import type { Knex } from 'knex'

import { awsSettingPath } from '@xrengine/common/src/schemas/setting/aws-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const awsSetting = await knex.table(awsSettingPath).first()
  if (awsSetting) {
    const eks = JSON.parse(awsSetting.eks)
    const s3 = JSON.parse(awsSetting.s3)
    await knex.table(awsSettingPath).update({
      eks: JSON.stringify({
        ...eks,
        roleArn: process.env.EKS_AWS_ROLE_ARN
      }),
      s3: JSON.stringify({
        ...s3,
        roleArn: process.env.EKS_AWS_ROLE_ARN
      })
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const awsSetting = await knex.table(awsSettingPath).first()
  if (awsSetting)
    await knex.table(awsSettingPath).update({
      eks: JSON.stringify({
        accessKeyId: awsSetting.eks.accessKeyId,
        secretAccessKey: awsSetting.eks.secretAccessKey
      }),
      s3: JSON.stringify({
        accessKeyId: awsSetting.s3.accessKeyId,
        secretAccessKey: awsSetting.s3.secretAccessKey
      })
    })
}
