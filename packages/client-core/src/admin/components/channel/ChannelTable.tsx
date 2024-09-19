
import React from 'react'
import { useTranslation } from 'react-i18next'
import { HiPencil, HiTrash } from 'react-icons/hi2'

import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { useFind, useMutation, useSearch } from '@xrengine/common'
import { channelPath, ChannelType } from '@xrengine/common/src/schema.type.module'
import { State } from '@xrengine/hyperflux'
import ConfirmDialog from '@xrengine/ui/src/components/tailwind/ConfirmDialog'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Checkbox from '@xrengine/ui/src/primitives/tailwind/Checkbox'
import { validate as isValidUUID } from 'uuid'

import { channelColumns, ChannelRowType } from '../../common/constants/channel'
import DataTable from '../../common/Table'
import AddEditChannelModal from './AddEditChannelModal'

export default function ChannelTable({
  search,
  selectedChannels
}: {
  search: string
  selectedChannels: State<ChannelType[]>
}) {
  const { t } = useTranslation()

  const adminChannelsQuery = useFind(channelPath, {
    query: {
      action: 'admin',
      $limit: 20,
      $sort: {
        name: 1
      }
    }
  })
  const adminChannelRemove = useMutation(channelPath).remove

  useSearch(
    adminChannelsQuery,
    {
      $or: [
        {
          id: isValidUUID(search) ? search : undefined
        },
        {
          name: {
            $like: `%${search}%`
          }
        }
      ]
    },
    search
  )

  const createRows = (rows: readonly ChannelType[]): ChannelRowType[] =>
    rows.map((row) => ({
      select: (
        <Checkbox
          value={selectedChannels.value.findIndex((invite) => invite.id === row.id) !== -1}
          onChange={(value) => {
            if (value) selectedChannels.merge([row])
            else selectedChannels.set((prevInvites) => prevInvites.filter((invite) => invite.id !== row.id))
          }}
        />
      ),
      id: row.id,
      name: row.name,
      action: (
        <div className="flex items-center justify-start gap-3">
          <Button
            rounded="full"
            variant="outline"
            className="h-8 w-8"
            title={t('admin:components.common.view')}
            onClick={() => PopoverState.showPopupover(<AddEditChannelModal channel={row} />)}
          >
            <HiPencil className="place-self-center text-theme-iconGreen" />
          </Button>
          <Button
            rounded="full"
            variant="outline"
            className="h-8 w-8"
            title={t('admin:components.common.delete')}
            onClick={() =>
              PopoverState.showPopupover(
                <ConfirmDialog
                  text={`${t('admin:components.channel.confirmChannelDelete')} '${row.name}'?`}
                  onSubmit={async () => {
                    adminChannelRemove(row.id)
                  }}
                />
              )
            }
          >
            <HiTrash className="place-self-center text-theme-iconRed" />
          </Button>
        </div>
      )
    }))

  return (
    <DataTable
      query={adminChannelsQuery}
      columns={[
        {
          id: 'select',
          label: (
            <Checkbox
              value={selectedChannels.length === adminChannelsQuery.data.length}
              onChange={(value) => {
                if (value) selectedChannels.set(adminChannelsQuery.data.slice())
                else selectedChannels.set([])
              }}
            />
          )
        },
        ...channelColumns
      ]}
      rows={createRows(adminChannelsQuery.data)}
    />
  )
}
