import React from 'react'
import { useTranslation } from 'react-i18next'

import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { useMutation } from '@xrengine/common'
import { channelPath, ChannelType } from '@xrengine/common/src/schema.type.module'
import { useHookstate } from '@xrengine/hyperflux'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import Modal from '@xrengine/ui/src/primitives/tailwind/Modal'

const getDefaultErrors = () => ({
  channelName: '',
  serverError: ''
})

export default function AddEditChannelModal({ channel }: { channel?: ChannelType }) {
  const { t } = useTranslation()

  const channelName = useHookstate(channel?.name || '')
  const channelMutation = useMutation(channelPath)

  const submitLoading = useHookstate(false)
  const errors = useHookstate(getDefaultErrors())

  const handleSubmit = async () => {
    errors.set(getDefaultErrors())

    if (!channelName.value) {
      errors.channelName.set(t('admin:components.channel.nameRequired'))
      return
    }

    try {
      if (channel?.id) {
        channelMutation.patch(channel.id, { name: channelName.value })
      } else {
        channelMutation.create({ name: channelName.value })
      }
      PopoverState.hidePopupover()
    } catch (err) {
      errors.serverError.set(err.message)
    }
  }

  return (
    <Modal
      title={channel?.id ? t('admin:components.channel.update') : t('admin:components.channel.createChannel')}
      className="w-[50vw] max-w-2xl"
      onSubmit={handleSubmit}
      onClose={PopoverState.hidePopupover}
      submitLoading={submitLoading.value}
    >
      {errors.serverError.value && <p className="mb-3 text-red-700">{errors.serverError.value}</p>}
      <Input
        label={t('admin:components.channel.name')}
        value={channelName.value}
        onChange={(event) => channelName.set(event.target.value)}
        error={errors.channelName.value}
      />
    </Modal>
  )
}
