
import React from 'react'
import { useTranslation } from 'react-i18next'

import { NotificationService } from '@xrengine/client-core/src/common/services/NotificationService'
import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { InviteService } from '@xrengine/client-core/src/social/services/InviteService'
import { useFind, useMutation } from '@xrengine/common'
import {
  InviteCode,
  InviteData,
  InviteType,
  instancePath,
  invitePath,
  locationPath,
  userPath
} from '@xrengine/common/src/schema.type.module'
import { convertDateTimeSqlToLocal, toDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import { useHookstate } from '@xrengine/hyperflux'
import Checkbox from '@xrengine/ui/src/primitives/tailwind/Checkbox'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import Modal from '@xrengine/ui/src/primitives/tailwind/Modal'
import MultiEmailInput from '@xrengine/ui/src/primitives/tailwind/MultiEmailInput'
import Radios from '@xrengine/ui/src/primitives/tailwind/Radio'
import Select from '@xrengine/ui/src/primitives/tailwind/Select'

type InviteTypeOptionsType = 'new-user' | 'location' | 'instance'
const inviteTypeOptions = ['new-user', 'location', 'instance'] as InviteTypeOptionsType[]

type SpawnType = 'spawnPoint' | 'userPosition'
const spawnTypeOptions = ['spawnPoint', 'userPosition'] as SpawnType[]

const getDefaultErrors = () => ({
  recipients: '',
  inviteLocation: '',
  inviteInstance: '',
  spawnPoint: '',
  userPosition: '',
  startTime: '',
  endTime: ''
})

export default function AddEditInviteModal({ invite }: { invite?: InviteType }) {
  const { t } = useTranslation()

  const adminLocations = useFind(locationPath, { query: { action: 'admin' } }).data
  const adminInstances = useFind(instancePath).data
  const adminUsers = useFind(userPath, { query: { isGuest: false } }).data
  const patchInvite = useMutation(invitePath).patch

  const emailRecipients = useHookstate(invite?.token ? [invite.token] : ([] as string[]))
  const inviteType = useHookstate<InviteTypeOptionsType>((invite?.inviteType as InviteTypeOptionsType) || 'new-user')
  const oneTimeInvite = useHookstate(invite?.deleteOnUse || false)
  const makeAdmin = useHookstate(invite?.makeAdmin || false)

  const timedInvite = useHookstate(invite?.timed || false)
  const inviteStartTime = useHookstate(invite?.startTime ? convertDateTimeSqlToLocal(invite.startTime) : '')
  const inviteEndTime = useHookstate(invite?.endTime ? convertDateTimeSqlToLocal(invite.endTime) : '')

  const inviteLocation = useHookstate((invite?.inviteType === 'location' && invite.targetObjectId) || '')
  const inviteInstance = useHookstate((invite?.inviteType === 'instance' && invite.targetObjectId) || '')
  const spawnSelected = useHookstate(false)
  const spawnType = useHookstate<SpawnType>((invite?.spawnType as SpawnType) || 'spawnPoint')
  const spawnPoint = useHookstate(invite?.spawnDetails?.spawnPoint || '')
  const userPosition = useHookstate(invite?.spawnDetails?.inviteCode || '')

  const errors = useHookstate(getDefaultErrors())
  const submitLoading = useHookstate(false)

  /** @todo spawn point support */
  const spawnPoints = [] as any[]
  const spawnPointOptions = [
    ...spawnPoints.map(([id, value]) => {
      const transform = value.components.find((component) => component.name === 'transform')
      if (transform) {
        const position = transform.props.position
        return {
          value: id,
          label: `${id} (x: ${position.x}, y: ${position.y}, z: ${position.z})`
        }
      }
      return {
        value: id,
        label: id
      }
    }),
    { value: '', label: t('admin:components.invite.selectSpawnPoint'), disabled: true }
  ]

  const handleSubmit = async () => {
    errors.set(getDefaultErrors())

    if (!emailRecipients.length) {
      errors.recipients.set(t('admin:components.invite.errors.recipients'))
    }
    if (inviteType.value === 'location' && !inviteLocation.value) {
      errors.inviteLocation.set(t('admin:components.invite.errors.inviteLocation'))
    }
    if (inviteType.value === 'instance' && !inviteInstance.value) {
      errors.inviteInstance.set(t('admin:components.invite.errors.inviteInstance'))
    }
    if (timedInvite.value && (!inviteStartTime.value || !inviteEndTime.value)) {
      errors.startTime.set(t('admin:components.invite.errors.startTime'))
      errors.endTime.set(t('admin:components.invite.errors.endTime'))
    }
    if (
      spawnSelected.value &&
      ((inviteType.value === 'location' && inviteLocation.value) ||
        (inviteType.value === 'instance' && inviteInstance.value))
    ) {
      if (spawnType.value === 'spawnPoint' && !spawnPoint.value) {
        errors.spawnPoint.set(t('admin:components.invite.errors.spawnPoint'))
      } else if (spawnType.value === 'userPosition' && !userPosition.value) {
        errors.userPosition.set(t('admin:components.invite.errors.userPosition'))
      }
    }

    if (Object.values(errors.value).some((value) => value.length > 0)) {
      return
    }

    const sendInvitePromises = emailRecipients.value.map(async (email) => {
      const inviteData: InviteData = {
        token: email,
        inviteType: inviteType.value,
        identityProviderType: 'email',
        targetObjectId:
          inviteType.value === 'location'
            ? inviteLocation.value
            : inviteType.value === 'instance'
            ? inviteInstance.value
            : undefined,
        makeAdmin: makeAdmin.value,
        deleteOnUse: oneTimeInvite.value
      }

      if (spawnSelected.value) {
        if (spawnType.value === 'spawnPoint') {
          inviteData.spawnType = 'spawnPoint'
          inviteData.spawnDetails = { spawnPoint: spawnPoint.value }
        } else if (spawnType.value === 'userPosition') {
          inviteData.spawnType = 'inviteCode'
          inviteData.spawnDetails = { inviteCode: userPosition.value as InviteCode }
        }
      }

      if (timedInvite.value) {
        inviteData.timed = true
        inviteData.startTime = toDateTimeSql(new Date(inviteStartTime.value))
        inviteData.endTime = toDateTimeSql(new Date(inviteEndTime.value))
      }

      if (invite?.id) {
        await patchInvite(invite.id, inviteData)
      } else {
        await InviteService.sendInvite(inviteData, '' as InviteCode)
      }
    })

    submitLoading.set(true)

    try {
      await Promise.all(sendInvitePromises)
      PopoverState.hidePopupover()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
      submitLoading.set(false)
    }
  }

  return (
    <Modal
      title={invite?.id ? t('admin:components.invite.update') : t('admin:components.invite.create')}
      className="w-[50vw] max-w-2xl"
      onSubmit={handleSubmit}
      onClose={PopoverState.hidePopupover}
      submitLoading={submitLoading.value}
    >
      <div className="relative grid w-full gap-6">
        {invite?.id ? (
          <Input
            label={t('admin:components.invite.recipients')}
            value={emailRecipients[0].value}
            onChange={() => {}}
            disabled={true}
          />
        ) : (
          <MultiEmailInput
            emailList={emailRecipients}
            label={t('admin:components.invite.recipients')}
            error={errors.recipients.value}
            disabled={submitLoading.value}
          />
        )}
        <Select
          label={t('admin:components.invite.type')}
          options={inviteTypeOptions.map((type) => ({ label: t(`admin:components.invite.${type}`), value: type }))}
          currentValue={inviteType.value}
          onChange={(value) => inviteType.set(value)}
          disabled={submitLoading.value}
        />
        {inviteType.value === 'location' && (
          <Select
            label={t('admin:components.invite.location')}
            options={[
              { value: '', label: t('admin:components.invite.selectLocation'), disabled: true },
              ...adminLocations.map((location) => ({
                value: location.id,
                label: location.name
              }))
            ]}
            currentValue={inviteLocation.value}
            onChange={(value) => inviteLocation.set(value)}
            error={errors.inviteLocation.value}
            disabled={submitLoading.value}
          />
        )}
        {inviteType.value === 'instance' && (
          <Select
            label={t('admin:components.invite.instance')}
            options={[
              { value: '', label: t('admin:components.invite.selectInstance'), disabled: true },
              ...adminInstances.map((instance) => ({
                label: `${instance.id} (${instance.location.name})`,
                value: instance.id
              }))
            ]}
            currentValue={inviteInstance.value}
            onChange={(value) => inviteInstance.set(value)}
            error={errors.inviteInstance.value}
            disabled={submitLoading.value}
          />
        )}
        {((inviteType.value === 'instance' && inviteInstance.value) ||
          (inviteType.value === 'location' && inviteLocation.value)) && (
          <>
            <Checkbox
              label={t('admin:components.invite.spawnAtPosition')}
              value={spawnSelected.value}
              onChange={(value) => spawnSelected.set(value)}
              disabled={submitLoading.value}
            />
            {spawnSelected.value && (
              <>
                <Radios
                  horizontal
                  options={spawnTypeOptions.map((option) => ({
                    value: option,
                    label: t(`admin:components.invite.${option}`)
                  }))}
                  value={spawnType.value}
                  onChange={(value) => spawnType.set(value)}
                  disabled={submitLoading.value}
                />
                {spawnType.value === 'spawnPoint' && (
                  <Select
                    label={t('admin:components.invite.spawnPoint')}
                    options={spawnPointOptions}
                    currentValue={spawnPoint.value}
                    onChange={(value) => spawnPoint.set(value)}
                    disabled={submitLoading.value}
                  />
                )}
                {spawnType.value === 'userPosition' && (
                  <Select
                    label={t('admin:components.invite.userPosition')}
                    options={[
                      { label: t('admin:components.invite.selectUserPosition'), value: '', disabled: true },
                      ...adminUsers
                        .filter((user) => user.inviteCode)
                        .map((user) => ({
                          value: user.inviteCode!,
                          label: `${user.name} (${user.inviteCode})`
                        }))
                    ]}
                    currentValue={userPosition.value}
                    onChange={(value) => userPosition.set(value)}
                    disabled={submitLoading.value}
                  />
                )}
              </>
            )}
          </>
        )}
        <Checkbox
          label={t('admin:components.invite.oneTime')}
          value={oneTimeInvite.value}
          onChange={(value) => oneTimeInvite.set(value)}
          disabled={submitLoading.value}
        />
        <Checkbox
          label={t('admin:components.invite.timedInvite')}
          value={timedInvite.value}
          onChange={(value) => timedInvite.set(value)}
          disabled={submitLoading.value}
        />
        {timedInvite.value && (
          <div className="flex justify-between">
            <Input
              type="datetime-local"
              className="w-auto"
              label={t('admin:components.invite.startTime')}
              value={inviteStartTime.value}
              onChange={(event) => inviteStartTime.set(event.target.value)}
              error={errors.startTime.value}
              disabled={submitLoading.value}
            />
            <Input
              type="datetime-local"
              className="w-auto"
              label={t('admin:components.invite.endTime')}
              value={inviteEndTime.value}
              onChange={(event) => inviteEndTime.set(event.target.value)}
              error={errors.endTime.value}
              disabled={submitLoading.value}
            />
          </div>
        )}
        {inviteType.value === 'new-user' && (
          <Checkbox
            label={t('admin:components.invite.makeAdmin')}
            value={makeAdmin.value}
            onChange={(value) => makeAdmin.set(value)}
            disabled={submitLoading.value}
          />
        )}
      </div>
    </Modal>
  )
}
