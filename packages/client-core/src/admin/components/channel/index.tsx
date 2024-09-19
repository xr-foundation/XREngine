
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMagnifyingGlass, HiPlus, HiTrash } from 'react-icons/hi2'

import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { useMutation } from '@xrengine/common'
import { channelPath, ChannelType } from '@xrengine/common/src/schema.type.module'
import { useHookstate } from '@xrengine/hyperflux'
import ConfirmDialog from '@xrengine/ui/src/components/tailwind/ConfirmDialog'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'

import AddEditChannelModal from './AddEditChannelModal'
import ChannelTable from './ChannelTable'

export default function Channels() {
  const { t } = useTranslation()
  const search = useHookstate({ local: '', query: '' })
  const debouncedSearchQueryRef = useRef<ReturnType<typeof setTimeout>>()

  const selectedChannels = useHookstate<ChannelType[]>([])
  const adminChannelRemove = useMutation(channelPath).remove

  useEffect(() => clearTimeout(debouncedSearchQueryRef.current), [])

  return (
    <>
      <div>
        <Text fontSize="xl" className="mb-6">
          {t('admin:components.channel.channels')}
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
            {selectedChannels.length > 0 && (
              <div>
                <Button
                  startIcon={<HiTrash />}
                  variant="danger"
                  size="small"
                  fullWidth
                  onClick={() => {
                    PopoverState.showPopupover(
                      <ConfirmDialog
                        text={t('admin:components.channel.confirmMultiChannelDelete')}
                        onSubmit={async () => {
                          await Promise.all(
                            selectedChannels.value.map((channel) => {
                              adminChannelRemove(channel.id)
                            })
                          )
                        }}
                      />
                    )
                  }}
                >
                  {t('admin:components.channel.removeChannels')}
                </Button>
              </div>
            )}
            <div className="ml-auto">
              <Button
                startIcon={<HiPlus />}
                size="small"
                fullWidth
                onClick={() => {
                  PopoverState.showPopupover(<AddEditChannelModal />)
                }}
              >
                {t('admin:components.channel.createChannel')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ChannelTable selectedChannels={selectedChannels} search={search.query.value} />
    </>
  )
}
