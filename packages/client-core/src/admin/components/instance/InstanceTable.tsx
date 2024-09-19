import { useFind, useMutation, useSearch } from '@xrengine/common'
import { InstanceType, instancePath } from '@xrengine/common/src/schema.type.module'
import ConfirmDialog from '@xrengine/ui/src/components/tailwind/ConfirmDialog'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { HiEye, HiTrash } from 'react-icons/hi2'
import { validate as isValidUUID } from 'uuid'
import { PopoverState } from '../../../common/services/PopoverState'
import DataTable from '../../common/Table'
import { instanceColumns } from '../../common/constants/instance'
import ViewModal from './ViewModal'

export default function InstanceTable({ search }: { search: string }) {
  const { t } = useTranslation()
  const instancesQuery = useFind(instancePath, {
    query: {
      $sort: { createdAt: 1 },
      $limit: 20,
      action: 'admin'
    }
  })

  useSearch(
    instancesQuery,
    {
      $or: [
        {
          id: isValidUUID(search) ? search : undefined
        },
        {
          locationId: isValidUUID(search) ? search : undefined
        },
        {
          channelId: isValidUUID(search) ? search : undefined
        }
      ]
    },
    search
  )

  const removeInstance = useMutation(instancePath).remove

  const createRows = (rows: readonly InstanceType[]) =>
    rows.map((row) => ({
      id: row.id,
      ipAddress: row.ipAddress,
      currentUsers: row.currentUsers,
      locationName: row.location && row.location.name ? row.location.name : '',
      channelId: row.channelId,
      podName: row.podName,
      action: (
        <div className="flex items-center justify-start gap-3 px-2 py-1">
          <Button
            className="bg-theme-blue-secondary text-blue-700 dark:text-white"
            onClick={() => {
              PopoverState.showPopupover(<ViewModal instanceId={row.id} />)
            }}
            startIcon={<HiEye className="place-self-center text-blue-700 dark:text-white" />}
            size="small"
          >
            {t('admin:components.instance.actions.view')}
          </Button>
          <Button
            className="h-8 w-8 justify-center border border-theme-primary bg-transparent p-0"
            rounded="full"
            onClick={() => {
              PopoverState.showPopupover(
                <ConfirmDialog
                  text={`${t('admin:components.instance.confirmInstanceDelete')} (${row.id}) ?`}
                  onSubmit={async () => {
                    await removeInstance(row.id)
                  }}
                />
              )
            }}
          >
            <HiTrash className="place-self-center text-theme-iconRed" />
          </Button>
        </div>
      )
    }))

  return <DataTable query={instancesQuery} columns={instanceColumns} rows={createRows(instancesQuery.data)} />
}
