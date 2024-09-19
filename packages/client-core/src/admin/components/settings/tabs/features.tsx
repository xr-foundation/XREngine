
import Toggle from '@xrengine/ui/src/primitives/tailwind/Toggle'
import React, { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall, HiUser } from 'react-icons/hi2'

import { useHookstate } from '@hookstate/core'
import { useFind, useMutation } from '@xrengine/common'
import { FeatureFlags } from '@xrengine/common/src/constants/FeatureFlags'
import { FeatureFlagSettingType, featureFlagSettingPath } from '@xrengine/common/src/schema.type.module'
import { toDisplayDateTime } from '@xrengine/common/src/utils/datetime-sql'
import { getAllStringValueNodes } from '@xrengine/common/src/utils/getAllStringValueNodes'
import Accordion from '@xrengine/ui/src/primitives/tailwind/Accordion'
import Tooltip from '@xrengine/ui/src/primitives/tailwind/Tooltip'

const defaultProps = ['id', 'flagName', 'flagValue', 'userId', 'createdAt', 'updatedAt']

const FeaturesTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()
  const displayedFeatures = useHookstate<FeatureFlagSettingType[]>([])

  const featureFlagSettings = useFind(featureFlagSettingPath, { query: { paginate: false } })

  useEffect(() => {
    if (featureFlagSettings.status === 'success') {
      const defaultTypes = getAllStringValueNodes(FeatureFlags)
      const missingTypes = defaultTypes.filter(
        (type) =>
          !featureFlagSettings.data.find(
            (flag) =>
              flag.flagName === type &&
              !Object.keys(flag)
                .filter((key) => !defaultProps.includes(key))
                .some((item) => !item)
          )
      )

      const updatedFeatures: FeatureFlagSettingType[] = [
        ...missingTypes.map((type) => ({
          flagName: type,
          flagValue: true,
          id: '',
          createdAt: '',
          updatedAt: ''
        })),
        ...featureFlagSettings.data
      ]
      displayedFeatures.set(updatedFeatures)
    }
  }, [featureFlagSettings.data])

  return (
    <Accordion
      title={t('admin:components.setting.features.header')}
      subtitle={t('admin:components.setting.features.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      <div className="mt-6 grid grid-cols-1 gap-6">
        {displayedFeatures.value
          .toSorted()
          .sort((a, b) => a.flagName.localeCompare(b.flagName))
          .map((feature) => (
            <FeatureItem key={feature.flagName} feature={feature} />
          ))}
      </div>
    </Accordion>
  )
})

const FeatureItem = ({ feature }: { feature: FeatureFlagSettingType }) => {
  const { t } = useTranslation()

  const featureFlagSettingMutation = useMutation(featureFlagSettingPath)
  const additionalProps = Object.keys(feature).filter((key) => !defaultProps.includes(key))

  const createOrUpdateFeatureFlag = async (feature: FeatureFlagSettingType, enabled: boolean) => {
    if (feature.id) {
      await featureFlagSettingMutation.patch(feature.id, { flagValue: enabled })
    } else {
      await featureFlagSettingMutation.create({
        flagName: feature.flagName,
        flagValue: enabled
      })
    }
  }

  return (
    <div key={feature.id} className="flex items-center">
      <Toggle
        containerClassName="justify-start"
        label={feature.flagName}
        value={feature.flagValue}
        onChange={(value) => createOrUpdateFeatureFlag(feature, value)}
      />
      {feature.userId && (
        <Tooltip
          content={t('admin:components.common.lastUpdatedBy', {
            userId: feature.userId,
            updatedAt: toDisplayDateTime(feature.updatedAt)
          })}
        >
          <HiUser className="mx-2" />
        </Tooltip>
      )}
      {additionalProps
        .filter((key) => feature[key])
        .map((key) => (
          <div key={key} className="ml-6 text-sm text-gray-500">
            {key}: {feature[key]}
          </div>
        ))}
    </div>
  )
}

export default FeaturesTab
