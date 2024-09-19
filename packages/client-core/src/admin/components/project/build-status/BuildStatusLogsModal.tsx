
import { t } from 'i18next'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { BuildStatusType } from '@xrengine/common/src/schema.type.module'
import Badge from '@xrengine/ui/src/primitives/tailwind/Badge'
import CopyText from '@xrengine/ui/src/primitives/tailwind/CopyText'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import Label from '@xrengine/ui/src/primitives/tailwind/Label'
import Modal from '@xrengine/ui/src/primitives/tailwind/Modal'

import { toDisplayDateTime } from '@xrengine/common/src/utils/datetime-sql'
import { PopoverState } from '../../../../common/services/PopoverState'

const BuildStatusBadgeVariant = {
  success: 'success',
  ended: 'neutral',
  pending: 'neutral',
  failed: 'danger'
}

export function BuildStatusBadge({ status }: { status: string }) {
  return <Badge label={status} variant={BuildStatusBadgeVariant[status] || 'neutral'} className="w-20 rounded" />
}

export function getStartOrEndDate(dateString: string, endDate = false) {
  return endDate && !dateString ? t('admin:components.buildStatus.running') : toDisplayDateTime(dateString)
}

export default function BuildStatusLogsModal({ buildStatus }: { buildStatus: BuildStatusType }) {
  const { t } = useTranslation()

  return (
    <Modal
      className="w-[50vw]"
      title={t('admin:components.buildStatus.viewLogs')}
      onClose={() => PopoverState.hidePopupover()}
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-6">
        <Input disabled label={t('admin:components.buildStatus.columns.id')} value={buildStatus.id} />
        <div>
          <Label className="mb-2">{t('admin:components.buildStatus.columns.status')}</Label>
          <BuildStatusBadge status={buildStatus.status} />
        </div>
        <Input
          disabled
          label={t('admin:components.buildStatus.columns.dateStarted')}
          value={getStartOrEndDate(buildStatus.dateStarted)}
        />
        <Input
          disabled
          label={t('admin:components.buildStatus.columns.dateEnded')}
          value={getStartOrEndDate(buildStatus.dateEnded)}
        />
        <div className="col-span-2 max-h-[50vh] overflow-auto">
          <pre className="relative text-wrap bg-stone-300 px-4 py-2 text-sm font-[var(--lato)] dark:bg-stone-800">
            <div className="sticky right-0 top-0 float-right ml-[-100%] h-[calc(100%-1px)] w-[calc(100%-1px)]">
              <CopyText text={buildStatus.logs} className="sticky" />
            </div>
            {buildStatus.logs}
          </pre>
        </div>
      </div>
    </Modal>
  )
}
