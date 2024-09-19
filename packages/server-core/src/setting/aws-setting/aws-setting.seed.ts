
import { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

import { AwsSettingDatabaseType, awsSettingPath } from '@xrengine/common/src/schemas/setting/aws-setting.schema'
import { getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import appConfig from '@xrengine/server-core/src/appconfig'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: AwsSettingDatabaseType[] = await Promise.all(
    [
      {
        s3: JSON.stringify({
          accessKeyId: process.env.STORAGE_AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.STORAGE_AWS_ACCESS_KEY_SECRET,
          roleArn: process.env.STORAGE_AWS_ROLE_ARN,
          endpoint: process.env.STORAGE_S3_ENDPOINT,
          staticResourceBucket: process.env.STORAGE_S3_STATIC_RESOURCE_BUCKET,
          region: process.env.STORAGE_S3_REGION,
          avatarDir: process.env.STORAGE_S3_AVATAR_DIRECTORY,
          s3DevMode: process.env.STORAGE_S3_DEV_MODE
        }),
        eks: JSON.stringify({
          accessKeyId: process.env.EKS_AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.EKS_AWS_ACCESS_KEY_SECRET,
          roleArn: process.env.EKS_AWS_ROLE_ARN
        }),
        cloudfront: JSON.stringify({
          domain:
            process.env.SERVE_CLIENT_FROM_STORAGE_PROVIDER === 'true'
              ? process.env.APP_HOST
              : process.env.STORAGE_CLOUDFRONT_DOMAIN!,
          distributionId: process.env.STORAGE_CLOUDFRONT_DISTRIBUTION_ID,
          region: process.env.STORAGE_CLOUDFRONT_REGION || process.env.STORAGE_S3_REGION
        }),
        sms: JSON.stringify({
          accessKeyId: process.env.AWS_SMS_ACCESS_KEY_ID,
          applicationId: process.env.AWS_SMS_APPLICATION_ID,
          region: process.env.AWS_SMS_REGION,
          senderId: process.env.AWS_SMS_SENDER_ID,
          secretAccessKey: process.env.AWS_SMS_SECRET_ACCESS_KEY
        })
      }
    ].map(async (item) => ({
      ...item,
      id: uuidv4(),
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }))
  )

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(awsSettingPath).del()

    // Inserts seed entries
    await knex(awsSettingPath).insert(seedData)
  } else {
    const existingData = await knex(awsSettingPath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(awsSettingPath).insert(item)
      }
    }
  }
}
