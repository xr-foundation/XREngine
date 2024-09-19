import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMagnifyingGlass, HiPlus } from 'react-icons/hi2'

import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { InviteType } from '@xrengine/common/src/schema.type.module'
import { useHookstate } from '@xrengine/hyperflux'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'

import AddEditInviteModal from './AddEditInviteModal'
import InviteTable from './InviteTable'
import RemoveInviteModal from './RemoveInviteModal'

export default function Invites() {
  const { t } = useTranslation()
  const search = useHookstate({ local: '', query: '' })
  const debouncedSearchQueryRef = useRef<ReturnType<typeof setTimeout>>()

  const selectedInvites = useHookstate<InviteType[]>([])

  useEffect(() => clearTimeout(debouncedSearchQueryRef.current), [])

  return (
    <>
      <div>
        <Text fontSize="xl" className="mb-6">
          {t('admin:components.invite.invites')}
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
          <div className="flex gap-4">
            {selectedInvites.length > 0 && (
              <div>
                <Button
                  variant="danger"
                  size="small"
                  fullWidth
                  onClick={() => {
                    PopoverState.showPopupover(<RemoveInviteModal invites={selectedInvites.value as InviteType[]} />)
                  }}
                >
                  {t('admin:components.invite.removeInvites')}
                </Button>
              </div>
            )}
            <div className="ml-auto">
              <Button
                startIcon={<HiPlus />}
                size="small"
                fullWidth
                onClick={() => {
                  PopoverState.showPopupover(<AddEditInviteModal />)
                }}
              >
                {t('admin:components.invite.create')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <InviteTable selectedInvites={selectedInvites} search={search.query.value} />
    </>
  )
}
