
import { Id, NullableId } from '@feathersjs/feathers'
import { useFind, useMutation, useSearch } from '@xrengine/common'
import { UserType, userPath } from '@xrengine/common/src/schema.type.module'
import { toDisplayDateTime } from '@xrengine/common/src/utils/datetime-sql'
import { State, getMutableState, useHookstate } from '@xrengine/hyperflux'
import ConfirmDialog from '@xrengine/ui/src/components/tailwind/ConfirmDialog'
import AvatarImage from '@xrengine/ui/src/primitives/tailwind/AvatarImage'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Checkbox from '@xrengine/ui/src/primitives/tailwind/Checkbox'
import Tooltip from '@xrengine/ui/src/primitives/tailwind/Tooltip'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FaRegCircleCheck, FaRegCircleXmark } from 'react-icons/fa6'
import { HiPencil, HiTrash } from 'react-icons/hi2'
import { LuInfo } from 'react-icons/lu'
import { PopoverState } from '../../../common/services/PopoverState'
import { AuthState } from '../../../user/services/AuthService'
import { userHasAccess } from '../../../user/userHasAccess'
import DataTable from '../../common/Table'
import { UserRowType, userColumns } from '../../common/constants/user'
import AccountIdentifiers from './AccountIdentifiers'
import AddEditUserModal from './AddEditUserModal'

export const removeUsers = async (
  modalProcessing: State<boolean>,
  adminUserRemove: {
    (id: Id): Promise<UserType>
    (id: null): Promise<UserType[]>
    (id: NullableId): Promise<any>
  },
  users: UserType[]
) => {
  modalProcessing.set(true)
  await Promise.all(
    users.map((user) => {
      adminUserRemove(user.id)
    })
  )
  PopoverState.hidePopupover()
  modalProcessing.set(false)
}

export default function UserTable({
  search,
  skipGuests,
  selectedUsers
}: {
  skipGuests: boolean
  search: string
  selectedUsers: State<UserType[]>
}) {
  const { t } = useTranslation()
  const user = useHookstate(getMutableState(AuthState).user)

  const adminUserQuery = useFind(userPath, {
    query: {
      isGuest: skipGuests ? false : undefined,
      $skip: 0,
      $limit: 20,
      $sort: {
        name: 1
      }
    }
  })

  useSearch(
    adminUserQuery,
    {
      search
    },
    search
  )

  const adminUserRemove = useMutation(userPath).remove
  const modalProcessing = useHookstate(false)

  const createRows = (rows: readonly UserType[]): UserRowType[] =>
    rows.map((row) => {
      return {
        select: (
          <Checkbox
            value={selectedUsers.value.findIndex((invite) => invite.id === row.id) !== -1}
            onChange={(value) => {
              if (value) selectedUsers.merge([row])
              else selectedUsers.set((prevInvites) => prevInvites.filter((invite) => invite.id !== row.id))
            }}
          />
        ),
        id: row.id,
        name: row.name,
        avatar: <AvatarImage src={row?.avatar?.thumbnailResource?.url || ''} name={row.name} />,
        accountIdentifier: <AccountIdentifiers user={row} />,
        lastLogin: row.lastLogin && (
          <div className="flex">
            {toDisplayDateTime(row.lastLogin.createdAt)}
            <Tooltip
              content={
                <>
                  <span>IP Address: {row.lastLogin.ipAddress}</span>
                  <br />
                  <span>User Agent: {row.lastLogin.userAgent}</span>
                </>
              }
            >
              <LuInfo className="ml-2 h-5 w-5 bg-transparent" />
            </Tooltip>
          </div>
        ),
        acceptedTOS: row.acceptedTOS ? (
          <FaRegCircleCheck className="h-5 w-5 text-theme-iconGreen" />
        ) : (
          <FaRegCircleXmark className="h-5 w-5 text-theme-iconRed" />
        ),
        isGuest: row.isGuest.toString(),
        action: (
          <div className="flex items-center justify-start gap-3">
            <Button
              rounded="full"
              variant="outline"
              className="h-8 w-8"
              disabled={!userHasAccess('location:write')}
              title={t('admin:components.common.view')}
              onClick={() => PopoverState.showPopupover(<AddEditUserModal user={row} />)}
            >
              <HiPencil className="place-self-center text-theme-iconGreen" />
            </Button>
            <Button
              rounded="full"
              variant="outline"
              className="h-8 w-8"
              disabled={user.id.value === row.id}
              title={t('admin:components.common.delete')}
              onClick={() => {
                PopoverState.showPopupover(
                  <ConfirmDialog
                    text={`${t('admin:components.user.confirmUserDelete')} '${row.name}'?`}
                    onSubmit={async () => {
                      await removeUsers(modalProcessing, adminUserRemove, [row])
                    }}
                  />
                )
              }}
            >
              <HiTrash className="place-self-center text-theme-iconRed" />
            </Button>
          </div>
        )
      }
    })

  return (
    <DataTable
      query={adminUserQuery}
      columns={[
        {
          id: 'select',
          label: (
            <Checkbox
              value={selectedUsers.length === adminUserQuery.data.length}
              onChange={(value) => {
                if (value) selectedUsers.set(adminUserQuery.data.slice())
                else selectedUsers.set([])
              }}
            />
          )
        },
        ...userColumns
      ]}
      rows={createRows(adminUserQuery.data)}
    />
  )
}
