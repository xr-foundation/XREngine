import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMagnifyingGlass } from 'react-icons/hi2'

import { useMutation } from '@xrengine/common'
import { userPath, UserType } from '@xrengine/common/src/schema.type.module'
import { useHookstate } from '@xrengine/hyperflux'
import ConfirmDialog from '@xrengine/ui/src/components/tailwind/ConfirmDialog'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'

import { PopoverState } from '../../../common/services/PopoverState'
import UserTable, { removeUsers } from './UserTable'

export default function Users() {
  const { t } = useTranslation()
  const search = useHookstate({ local: '', query: '' })
  const skipGuests = useHookstate(false)
  const debouncedSearchQueryRef = useRef<ReturnType<typeof setTimeout>>()

  const selectedUsers = useHookstate<UserType[]>([])

  useEffect(() => clearTimeout(debouncedSearchQueryRef.current), [])

  const adminUserRemove = useMutation(userPath).remove
  const modalProcessing = useHookstate(false)

  return (
    <>
      <div>
        <Text fontSize="xl" className="mb-6">
          {t('admin:components.user.users')}
        </Text>
        <div className="mb-4 flex justify-between">
          <Input
            placeholder={t('common:components.search')}
            value={search.local.value}
            onChange={(event) => {
              search.local.set(event.target.value)

              if (debouncedSearchQueryRef) {
                clearTimeout(debouncedSearchQueryRef.current)
              }

              debouncedSearchQueryRef.current = setTimeout(() => {
                search.query.set(event.target.value)
              }, 100)
            }}
            className="bg-theme-surface-main"
            containerClassName="w-1/5 block"
            startComponent={<HiMagnifyingGlass />}
          />
          {selectedUsers.length > 0 && (
            <Button
              variant="danger"
              size="small"
              onClick={() => {
                PopoverState.showPopupover(
                  <ConfirmDialog
                    text={t('admin:components.user.confirmMultiUserDelete')}
                    onSubmit={async () => {
                      removeUsers(modalProcessing, adminUserRemove, selectedUsers.value as UserType[])
                    }}
                  />
                )
              }}
            >
              {t('admin:components.user.removeUsers')}
            </Button>
          )}
        </div>
      </div>
      <UserTable skipGuests={skipGuests.value} search={search.query.value} selectedUsers={selectedUsers} />
    </>
  )
}
