import React from 'react'
import { useTranslation } from 'react-i18next'
import { HiTrash } from 'react-icons/hi2'

import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { useFind, useSearch } from '@xrengine/common'
import { invitePath, InviteType, UserName } from '@xrengine/common/src/schema.type.module'
import { State } from '@xrengine/hyperflux'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Checkbox from '@xrengine/ui/src/primitives/tailwind/Checkbox'
import { validate as isValidUUID } from 'uuid'

import { inviteColumns, InviteRowType } from '../../common/constants/invite'
import DataTable from '../../common/Table'
import AddEditInviteModal from './AddEditInviteModal'
import RemoveInviteModal from './RemoveInviteModal'

export default function InviteTable({
  search,
  selectedInvites
}: {
  search: string
  selectedInvites: State<InviteType[]>
}) {
  const { t } = useTranslation()

  const adminInviteQuery = useFind(invitePath, {
    query: {
      $limit: 20,
      $sort: {
        id: 1
      }
    }
  })

  useSearch(
    adminInviteQuery,
    {
      $or: [
        {
          id: isValidUUID(search) ? search : undefined
        },
        {
          userId: isValidUUID(search) ? search : undefined
        },
        {
          inviteeId: isValidUUID(search) ? search : undefined
        },
        {
          inviteType: {
            $like: '%' + search + '%'
          }
        },
        {
          passcode: {
            $like: '%' + search + '%'
          }
        }
      ]
    },
    search
  )

  const createRows = (rows: readonly InviteType[]): InviteRowType[] =>
    rows.map((row) => ({
      select: (
        <Checkbox
          value={selectedInvites.value.findIndex((invite) => invite.id === row.id) !== -1}
          onChange={(value) => {
            if (value) selectedInvites.merge([row])
            else selectedInvites.set((prevInvites) => prevInvites.filter((invite) => invite.id !== row.id))
          }}
        />
      ),
      id: row.id,
      name: row.invitee?.name || ((row.token || '') as UserName),
      passcode: row.passcode,
      type: row.inviteType,
      targetObjectId: row.targetObjectId,
      spawnType: row.spawnType,
      spawnDetails: row.spawnDetails ? JSON.stringify(row.spawnDetails) : '',
      action: (
        <div className="flex items-center gap-3">
          <Button
            size="small"
            variant="primary"
            onClick={() => PopoverState.showPopupover(<AddEditInviteModal invite={row} />)}
          >
            {t('admin:components:invite.update')}
          </Button>
          <Button
            variant="outline"
            startIcon={<HiTrash className="place-self-center text-theme-iconRed" />}
            onClick={() => PopoverState.showPopupover(<RemoveInviteModal invites={[row]} />)}
          />
        </div>
      )
    }))

  return (
    <DataTable
      query={adminInviteQuery}
      columns={[
        {
          id: 'select',
          label: (
            <Checkbox
              value={selectedInvites.length === adminInviteQuery.data.length}
              onChange={(value) => {
                if (value) selectedInvites.set(adminInviteQuery.data.slice())
                else selectedInvites.set([])
              }}
            />
          )
        },
        ...inviteColumns
      ]}
      rows={createRows(adminInviteQuery.data)}
    />
  )
}
