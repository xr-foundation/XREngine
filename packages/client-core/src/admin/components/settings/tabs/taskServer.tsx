
import React, { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

import { useFind } from '@xrengine/common'
import { EngineSettings } from '@xrengine/common/src/constants/EngineSettings'
import { engineSettingPath } from '@xrengine/common/src/schema.type.module'
import Accordion from '@xrengine/ui/src/primitives/tailwind/Accordion'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'

const TaskServerTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()

  const settingTaskServer = useFind(engineSettingPath, {
    query: {
      category: 'task-server',
      paginate: false
    }
  }).data

  const ports = settingTaskServer.filter((el) => el.key === EngineSettings.TaskServer.Port).map((el) => el.value)
  const processIntervals = settingTaskServer
    .filter((el) => el.key === EngineSettings.TaskServer.ProcessInterval)
    .map((el) => el.value)

  return (
    <Accordion
      title={t('admin:components.setting.taskServer.taskServer')}
      subtitle={t('admin:components.setting.taskServer.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      <div className="mt-6 grid grid-cols-2 gap-6">
        <Input
          className="col-span-1"
          label={t('admin:components.setting.taskServer.port')}
          value={ports.join(', ')}
          disabled
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.taskServer.processInterval')}
          value={processIntervals.join(', ')}
          disabled
        />
      </div>
    </Accordion>
  )
})

export default TaskServerTab
