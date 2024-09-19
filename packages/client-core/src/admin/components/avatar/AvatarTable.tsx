import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiPencil, HiTrash } from 'react-icons/hi2'
import { validate as isValidUUID } from 'uuid'

import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { useFind, useMutation, useSearch } from '@xrengine/common'
import { AvatarID, avatarPath, AvatarType, UserName } from '@xrengine/common/src/schema.type.module'
import { useHookstate } from '@xrengine/hyperflux'
import { ConfirmDialog } from '@xrengine/ui/src/components/tailwind/ConfirmDialog'
import AvatarImage from '@xrengine/ui/src/primitives/tailwind/AvatarImage'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Toggle from '@xrengine/ui/src/primitives/tailwind/Toggle'

import { avatarColumns, AvatarRowType } from '../../common/constants/avatar'
import DataTable from '../../common/Table'
import AddEditAvatarModal from './AddEditAvatarModal'

export default function AvatarTable({ search }: { search: string }) {
  const { t } = useTranslation()
  const adminAvatarQuery = useFind(avatarPath, {
    query: {
      action: 'admin',
      $limit: 20,
      $sort: {
        name: 1
      }
    }
  })
  const adminAvatarPatch = useMutation(avatarPath).patch

  useSearch(
    adminAvatarQuery,
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

  const IsPublicToggle = ({ id, isPublic }: { id: AvatarID; isPublic: boolean }) => {
    const disabled = useHookstate(false)
    return (
      <Toggle
        value={isPublic}
        onChange={(value) => {
          disabled.set(true)
          adminAvatarPatch(id, { isPublic: value })
            .then(() => adminAvatarQuery.refetch())
            .catch(() => disabled.set(false))
        }}
        disabled={disabled.value}
      />
    )
  }

  const adminAvatarRemove = useMutation(avatarPath).remove
  const errorText = useHookstate('')

  useEffect(() => {
    setTimeout(() => {
      errorText.set('I AM ERROR')
    }, 5000)
  }, [])

  const createRows = (rows: readonly AvatarType[]): AvatarRowType[] =>
    rows.map((row) => ({
      id: row.id,
      name: row.name,
      user: (row.user?.name || '') as UserName,
      isPublic: <IsPublicToggle id={row.id} isPublic={row.isPublic} />,
      thumbnail: <AvatarImage src={row.thumbnailResource?.url + '?' + new Date().getTime()} className="mx-auto" />,
      action: (
        <div className="flex items-center justify-start gap-3">
          <Button
            rounded="full"
            variant="outline"
            className="h-8 w-8"
            title={t('admin:components.common.view')}
            onClick={() => PopoverState.showPopupover(<AddEditAvatarModal avatar={row} />)}
          >
            <HiPencil className="place-self-center text-theme-iconGreen" />
          </Button>
          <Button
            rounded="full"
            variant="outline"
            className="h-8 w-8"
            title={t('admin:components.common.delete')}
            onClick={() => {
              PopoverState.showPopupover(
                <ConfirmDialog
                  text={`${t('admin:components.avatar.confirmAvatarDelete')} '${row.name}'?`}
                  onSubmit={async () => {
                    await adminAvatarRemove(row.id)
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

  return <DataTable query={adminAvatarQuery} columns={avatarColumns} rows={createRows(adminAvatarQuery.data)} />
}
