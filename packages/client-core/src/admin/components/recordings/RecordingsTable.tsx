
import React from 'react'
import { useTranslation } from 'react-i18next'
import { HiTrash } from 'react-icons/hi2'

import { useFind, useMutation, useSearch } from '@xrengine/common'
import { recordingPath, RecordingType } from '@xrengine/common/src/schema.type.module'
import ConfirmDialog from '@xrengine/ui/src/components/tailwind/ConfirmDialog'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import { validate as isValidUUID } from 'uuid'

import { PopoverState } from '../../../common/services/PopoverState'
import { recordingColumns } from '../../common/constants/recordings'
import DataTable from '../../common/Table'

export default function RecordingsTable({ search }: { search: string }) {
  const { t } = useTranslation()
  const recordingsQuery = useFind(recordingPath, {
    query: {
      $sort: { createdAt: 1 },
      $limit: 20,
      action: 'admin'
    }
  })

  useSearch(
    recordingsQuery,
    {
      $or: [
        {
          id: isValidUUID(search) ? search : undefined
        },
        {
          userId: isValidUUID(search) ? search : undefined
        }
      ]
    },
    search
  )

  const removeRecording = useMutation(recordingPath).remove

  const createRows = (rows: readonly RecordingType[]) =>
    rows.map((row) => ({
      id: row.id,
      user: row.userName,
      ended: row.ended ? t('admin:components.common.yes') : t('admin:components.common.no'),
      schema: JSON.stringify(row.schema),
      action: (
        <div className="flex w-full justify-center px-2 py-1">
          {/* <Button className="border-theme-primary h-8 w-8 justify-center border bg-transparent p-0" rounded>
            <HiEye className="place-self-center" />
          </Button> */}
          <Button
            className="h-8 w-8 justify-center border border-theme-primary bg-transparent p-0"
            rounded="full"
            onClick={() => {
              PopoverState.showPopupover(
                <ConfirmDialog
                  text={`${t('admin:components.recording.confirmRecordingDelete')} (${row.id}) ?`}
                  onSubmit={async () => {
                    await removeRecording(row.id)
                  }}
                />
              )
            }}
          >
            <HiTrash className="place-self-center text-[#E11D48] dark:text-[#FB7185]" />
          </Button>
        </div>
      )
    }))

  return <DataTable query={recordingsQuery} columns={recordingColumns} rows={createRows(recordingsQuery.data)} />
}
