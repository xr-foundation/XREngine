import React from 'react'
import { useTranslation } from 'react-i18next'

import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { useMutation } from '@xrengine/common'
import { invitePath, InviteType, UserName } from '@xrengine/common/src/schema.type.module'
import { useHookstate } from '@xrengine/hyperflux'
import Modal from '@xrengine/ui/src/primitives/tailwind/Modal'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'

export default function RemoveInviteModal({ invites }: { invites: InviteType[] }) {
  const { t } = useTranslation()
  const adminInviteRemove = useMutation(invitePath).remove
  const modalProcessing = useHookstate(false)
  const error = useHookstate('')

  const handleSubmit = async () => {
    modalProcessing.set(true)
    error.set('')
    try {
      await Promise.all(
        invites.map((invite) => {
          adminInviteRemove(invite.id)
        })
      )
      PopoverState.hidePopupover()
    } catch (err) {
      error.set(err.message)
    }
    modalProcessing.set(false)
  }

  return (
    <Modal
      title={invites.length === 1 ? t('admin:components.invite.remove') : t('admin:components.invite.removeInvites')}
      onSubmit={handleSubmit}
      onClose={PopoverState.hidePopupover}
      submitLoading={modalProcessing.value}
    >
      {error.value && <p className="mb-3 text-red-700">{error.value}</p>}
      <Text>
        {invites.length === 1
          ? `${t('admin:components.invite.confirmInviteDelete')} '${
              invites[0].invitee?.name || ((invites[0].token || '') as UserName)
            }'?`
          : t('admin:components.invite.confirmMultiInviteDelete')}
      </Text>
    </Modal>
  )
}
