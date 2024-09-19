
import React from 'react'
import { useTranslation } from 'react-i18next'

import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { useFind, useMutation } from '@xrengine/common'
import { LocationID, locationPath } from '@xrengine/common/src/schema.type.module'
import { useHookstate } from '@xrengine/hyperflux'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import Modal from '@xrengine/ui/src/primitives/tailwind/Modal'
import Select from '@xrengine/ui/src/primitives/tailwind/Select'

import { NotificationService } from '../../../common/services/NotificationService'

export default function PatchServerModal() {
  const { t } = useTranslation()
  const state = useHookstate({
    locationId: '',
    locationError: '',
    count: 1
  })
  const modalProcessing = useHookstate(false)

  const handleSubmit = () => {
    modalProcessing.set(true)
    patchInstanceserver({ locationId: state.locationId.value as LocationID, count: state.count.value })
      .then((patchResponse) => {
        NotificationService.dispatchNotify(patchResponse.message, {
          variant: patchResponse.status ? 'success' : 'error'
        })
        PopoverState.hidePopupover()
      })
      .catch((e) => {
        state.locationError.set(e.message)
      })
  }

  const adminLocations = useFind(locationPath, { query: { action: 'admin' } })
  const patchInstanceserver = useMutation('instanceserver-provision').patch

  const locationsMenu = adminLocations.data.map((el) => {
    return {
      label: el.name,
      value: el.id
    }
  })

  return (
    <Modal
      title={t('admin:components.setting.patchInstanceserver')}
      className="w-[50vw] max-w-2xl"
      onSubmit={handleSubmit}
      onClose={PopoverState.hidePopupover}
      submitLoading={modalProcessing.value}
    >
      <Select
        options={locationsMenu}
        currentValue={state.locationId.value}
        onChange={(value) => {
          state.locationId.set(value)
        }}
        className="mb-5"
        label={t('admin:components.instance.location')}
      />
      <Input
        type="number"
        value={state.count.value}
        onChange={(e) => {
          state.count.set(parseInt(e.target.value))
        }}
        label={t('admin:components.instance.count')}
      />
    </Modal>
  )
}
