
import React, { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

import { useFind, useMutation } from '@xrengine/common'
import { AwsCloudFrontType, AwsSmsType, awsSettingPath } from '@xrengine/common/src/schema.type.module'
import { useHookstate } from '@xrengine/hyperflux'
import Accordion from '@xrengine/ui/src/primitives/tailwind/Accordion'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'

const SMS_PROPERTIES = {
  ACCESS_KEY_ID: 'accessKeyId',
  APPLICATION_ID: 'applicationId',
  REGION: 'region',
  SENDER_ID: 'senderId',
  SECRET_ACCESS_KEY: 'secretAccessKey'
}

const CLOUDFRONT_PROPERTIES = {
  DOMAIN: 'domain',
  DISTRIBUTION_ID: 'distributionId',
  REGION: 'region'
}

const AwsTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()

  const patchAwsSettings = useMutation(awsSettingPath).patch
  const adminAwsSettingsData = useFind(awsSettingPath).data.at(0)

  const id = adminAwsSettingsData?.id
  const sms = useHookstate(adminAwsSettingsData?.sms)
  const cloudfront = useHookstate(adminAwsSettingsData?.cloudfront)

  useEffect(() => {
    if (!adminAwsSettingsData) {
      return
    }
    const tempSms = JSON.parse(JSON.stringify(adminAwsSettingsData.sms)) as AwsSmsType
    const tempCloudfront = JSON.parse(JSON.stringify(adminAwsSettingsData.cloudfront)) as AwsCloudFrontType
    sms.set(tempSms)
    cloudfront.set(tempCloudfront)
  }, [adminAwsSettingsData])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!id) return

    patchAwsSettings(id, { sms: sms.value, cloudfront: cloudfront.value })
  }

  const handleCancel = () => {
    const tempSms = JSON.parse(JSON.stringify(adminAwsSettingsData?.sms)) as AwsSmsType
    const tempCloudfront = JSON.parse(JSON.stringify(adminAwsSettingsData?.cloudfront)) as AwsCloudFrontType
    sms.set(tempSms)
    cloudfront.set(tempCloudfront)
  }

  const handleUpdateCloudfront = (event, type) => {
    cloudfront.set({
      ...JSON.parse(JSON.stringify(cloudfront.value)),
      [type]: event.target.value
    })
  }

  const handleUpdateSms = (event, type) => {
    sms.set({
      ...JSON.parse(JSON.stringify(sms.value)),
      [type]: event.target.value
    })
  }

  return (
    <Accordion
      title={t('admin:components.setting.aws.header')}
      subtitle={t('admin:components.setting.aws.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      <div className="mt-6 grid grid-cols-2 gap-6">
        <Text component="h2" fontSize="base" fontWeight="semibold" className="col-span-full">
          {t('admin:components.setting.eks')}
        </Text>

        <Input
          className="col-span-1"
          label={t('admin:components.setting.accessKeyId')}
          value={adminAwsSettingsData?.eks?.accessKeyId || ''}
          disabled
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.secretAccessKey')}
          value={adminAwsSettingsData?.eks?.secretAccessKey || ''}
          disabled
        />
      </div>

      <div className="my-4 grid grid-cols-2 gap-6">
        <Text component="h2" fontSize="base" fontWeight="semibold" className="col-span-full">
          {t('admin:components.setting.s3')}
        </Text>

        <Input
          className="col-span-1"
          label={t('admin:components.setting.accessKeyId')}
          value={adminAwsSettingsData?.s3?.accessKeyId || ''}
          disabled
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.secretAccessKey')}
          value={adminAwsSettingsData?.s3?.secretAccessKey || ''}
          disabled
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.endpoint')}
          value={adminAwsSettingsData?.s3?.endpoint || ''}
          disabled
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.staticResourceBucket')}
          value={adminAwsSettingsData?.s3?.staticResourceBucket || ''}
          disabled
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.region')}
          value={adminAwsSettingsData?.s3?.region || ''}
          disabled
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.avatarDir')}
          value={adminAwsSettingsData?.s3?.avatarDir || ''}
          disabled
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.s3DevMode')}
          value={adminAwsSettingsData?.s3?.s3DevMode || ''}
          disabled
        />
      </div>

      <div className="my-4 grid grid-cols-2 gap-6">
        <Text component="h2" fontSize="base" fontWeight="semibold" className="col-span-full">
          {t('admin:components.setting.cloudFront')}
        </Text>
        <Input
          className="col-span-1"
          label={t('admin:components.setting.domain')}
          value={cloudfront?.value?.domain || ''}
          onChange={(e) => handleUpdateCloudfront(e, CLOUDFRONT_PROPERTIES.DOMAIN)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.distributionId')}
          value={cloudfront?.value?.distributionId || ''}
          onChange={(e) => handleUpdateCloudfront(e, CLOUDFRONT_PROPERTIES.DISTRIBUTION_ID)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.region')}
          value={cloudfront?.value?.region || ''}
          onChange={(e) => handleUpdateCloudfront(e, CLOUDFRONT_PROPERTIES.REGION)}
        />
      </div>

      <div className="my-4 grid grid-cols-2 gap-6">
        <Text component="h2" fontSize="base" fontWeight="semibold" className="col-span-full">
          {t('admin:components.setting.sms')}
        </Text>
        <Input
          className="col-span-1"
          label={t('admin:components.setting.accessKeyId')}
          value={sms?.value?.accessKeyId || ''}
          onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.ACCESS_KEY_ID)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.applicationId')}
          value={sms?.value?.applicationId || ''}
          onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.APPLICATION_ID)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.region')}
          value={sms?.value?.region || ''}
          onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.REGION)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.senderId')}
          value={sms?.value?.senderId || ''}
          onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.SENDER_ID)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.secretAccessKey')}
          value={sms?.value?.secretAccessKey || ''}
          onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.SECRET_ACCESS_KEY)}
        />
      </div>

      <div className="grid grid-cols-8 gap-6">
        <Button size="small" className="text-primary col-span-1 bg-theme-highlight" fullWidth onClick={handleCancel}>
          {t('admin:components.common.reset')}
        </Button>
        <Button size="small" variant="primary" className="col-span-1" fullWidth onClick={handleSubmit}>
          {t('admin:components.common.save')}
        </Button>
      </div>
    </Accordion>
  )
})

export default AwsTab
