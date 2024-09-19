
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMagnifyingGlass, HiPlus } from 'react-icons/hi2'

import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { useHookstate } from '@xrengine/hyperflux'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'

import AddEditAvatarModal from './AddEditAvatarModal'
import AvatarTable from './AvatarTable'

export default function Avatars() {
  const { t } = useTranslation()
  const search = useHookstate({ local: '', query: '' })
  const debouncedSearchQueryRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => clearTimeout(debouncedSearchQueryRef.current), [])

  return (
    <>
      <div>
        <Text fontSize="xl" className="mb-6">
          {t('admin:components.avatar.avatars')}
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
          <div>
            <Button
              startIcon={<HiPlus />}
              size="small"
              fullWidth
              onClick={() => {
                PopoverState.showPopupover(<AddEditAvatarModal />)
              }}
            >
              {t('admin:components.avatar.add')}
            </Button>
          </div>
        </div>
      </div>
      <AvatarTable search={search.query.value} />
    </>
  )
}
