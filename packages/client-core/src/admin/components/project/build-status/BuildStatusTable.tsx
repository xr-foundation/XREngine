import React from 'react'
import { useTranslation } from 'react-i18next'
import { HiEye } from 'react-icons/hi2'

import { useFind } from '@xrengine/common'
import { buildStatusPath, BuildStatusType } from '@xrengine/common/src/schema.type.module'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'

import { PopoverState } from '../../../../common/services/PopoverState'
import { buildStatusColumns, BuildStatusRowType } from '../../../common/constants/build-status'
import DataTable from '../../../common/Table'
import BuildStatusLogsModal, { BuildStatusBadge, getStartOrEndDate } from './BuildStatusLogsModal'

export default function BuildStatusTable() {
  const { t } = useTranslation()

  const adminBuildStatusQuery = useFind(buildStatusPath, {
    query: {
      $limit: 10,
      $sort: {
        id: -1
      }
    }
  })

  const createRows = (rows: readonly BuildStatusType[]): BuildStatusRowType[] =>
    rows.map((row) => ({
      id: row.id.toString(),
      commitSHA: row.commitSHA,
      status: <BuildStatusBadge status={row.status} />,
      dateStarted: getStartOrEndDate(row.dateStarted),
      dateEnded: getStartOrEndDate(row.dateEnded, true),
      logs: (
        <Button
          size="small"
          disabled={!row.logs || !row.logs.length}
          startIcon={<HiEye />}
          onClick={() => {
            PopoverState.showPopupover(<BuildStatusLogsModal buildStatus={row} />)
          }}
        >
          {t('admin:components.buildStatus.viewLogs')}
        </Button>
      )
    }))

  return (
    <DataTable
      query={adminBuildStatusQuery}
      columns={buildStatusColumns}
      rows={createRows(adminBuildStatusQuery.data)}
    />
  )
}
