import React, { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

import { useFind } from '@xrengine/common'
import { redisSettingPath } from '@xrengine/common/src/schema.type.module'
import Accordion from '@xrengine/ui/src/primitives/tailwind/Accordion'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'

const RedisTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()

  const redisSetting = useFind(redisSettingPath).data.at(0)

  return (
    <Accordion
      title={t('admin:components.setting.redis.header')}
      subtitle={t('admin:components.setting.redis.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      <div className="mt-6 grid grid-cols-2 gap-6">
        <Input
          className="col-span-1"
          label={t('admin:components.setting.address')}
          value={redisSetting?.address || ''}
          disabled
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.password')}
          value={redisSetting?.password || ''}
          disabled
        />
      </div>
    </Accordion>
  )
})

export default RedisTab
