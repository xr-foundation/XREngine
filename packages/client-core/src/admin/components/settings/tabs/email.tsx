import React, { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

import { useFind, useMutation } from '@xrengine/common'
import { emailSettingPath } from '@xrengine/common/src/schema.type.module'
import { useHookstate } from '@xrengine/hyperflux'
import PasswordInput from '@xrengine/ui/src/components/tailwind/PasswordInput'
import Accordion from '@xrengine/ui/src/primitives/tailwind/Accordion'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import LoadingView from '@xrengine/ui/src/primitives/tailwind/LoadingView'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'
import Toggle from '@xrengine/ui/src/primitives/tailwind/Toggle'

const EmailTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()
  const state = useHookstate({
    loading: false,
    errorMessage: ''
  })
  const emailSetting = useFind(emailSettingPath).data.at(0)
  const id = emailSetting?.id
  const smsNameCharacterLimit = useHookstate(emailSetting?.smsNameCharacterLimit)
  const smtp = useHookstate(emailSetting?.smtp)
  const auth = useHookstate(emailSetting?.smtp?.auth)
  const from = useHookstate(emailSetting?.from)
  const subject = useHookstate(emailSetting?.subject)

  const patchEmailSetting = useMutation(emailSettingPath).patch

  const handleSmtpSecure = (value) => {
    smtp.set({ ...JSON.parse(JSON.stringify(smtp.value)), secure: value })
  }

  const handleUpdateSmtp = (event, type) => {
    smtp.set({
      ...JSON.parse(JSON.stringify(smtp.value)),
      [type]: event.target.value
    })
  }

  const handleUpdateAuth = (event, type) => {
    auth.set({
      ...JSON.parse(JSON.stringify(auth.value)),
      [type]: event.target.value
    })
  }

  useEffect(() => {
    if (emailSetting) {
      smtp.set(emailSetting?.smtp)
      auth.set(emailSetting?.smtp?.auth)
      subject.set(emailSetting?.subject)
      from.set(emailSetting?.from)
    }
  }, [emailSetting])

  const handleSubmit = (event) => {
    state.loading.set(true)
    event.preventDefault()

    if (!id || !smtp.value || !auth.value || !from.value || !subject.value) return

    patchEmailSetting(id, {
      smtp: { ...smtp.value, auth: auth.value, secure: Boolean(smtp.value.secure), port: Number(smtp.value.port) },
      from: from.value,
      subject: subject.value
    })
      .then(() => {
        state.set({ loading: false, errorMessage: '' })
      })
      .catch((e) => {
        state.set({ loading: false, errorMessage: e.message })
      })
  }

  const handleCancel = () => {
    smtp.set(emailSetting?.smtp)
    auth.set(emailSetting?.smtp?.auth)
    subject.set(emailSetting?.subject)
    from.set(emailSetting?.from)
    smsNameCharacterLimit.set(emailSetting?.smsNameCharacterLimit)
  }

  const handleUpdateSubject = (event, type) => {
    subject.set({
      ...JSON.parse(JSON.stringify(subject.value)),
      [type]: event.target.value
    })
  }

  return (
    <Accordion
      title={t('admin:components.setting.email.header')}
      subtitle={t('admin:components.setting.email.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      <div className="my-4 grid grid-cols-2 gap-4">
        <Text component="h2" fontSize="base" fontWeight="semibold" className="col-span-full">
          {t('admin:components.setting.smtp')}
        </Text>
        <Input
          className="col-span-2"
          label={t('admin:components.setting.host')}
          value={smtp?.value?.host || ''}
          onChange={(e) => handleUpdateSmtp(e, 'host')}
        />

        <Input
          className="col-span-2"
          label={t('admin:components.setting.port')}
          value={smtp?.value?.port || ''}
          onChange={(e) => handleUpdateSmtp(e, 'port')}
        />

        <Toggle
          className="col-span-2"
          label={t('admin:components.setting.secure')}
          value={smtp?.value?.secure || false}
          onChange={handleSmtpSecure}
        />
      </div>

      <div className="my-4 grid grid-cols-2 gap-4">
        <Text component="h2" fontSize="base" fontWeight="semibold" className="col-span-full">
          {t('admin:components.setting.from')}
        </Text>
        <Input
          className="col-span-2"
          label={t('admin:components.setting.from')}
          value={from?.value || ''}
          onChange={(e) => from.set(e.target.value)}
        />
      </div>

      <div className="my-4 grid grid-cols-2 gap-4">
        <Text component="h2" fontSize="base" fontWeight="semibold" className="col-span-full">
          {t('admin:components.setting.auth')}
        </Text>
        <Input
          className="col-span-2"
          label={t('admin:components.setting.userName')}
          value={auth?.value?.user || ''}
          onChange={(e) => handleUpdateAuth(e, 'user')}
        />

        <PasswordInput
          className="col-span-2"
          label={t('admin:components.setting.password')}
          value={auth?.value?.pass || ''}
          onChange={(e) => handleUpdateAuth(e, 'pass')}
        />
      </div>

      <div className="my-4 grid grid-cols-2 gap-4">
        <Text component="h2" fontSize="base" fontWeight="semibold" className="col-span-full">
          {t('admin:components.setting.subject')}
        </Text>
        <Input
          className="col-span-2"
          label={t('admin:components.setting.login')}
          value={subject?.value?.login || ''}
          onChange={(e) => handleUpdateSubject(e, 'login')}
        />

        <Input
          className="col-span-2"
          label={t('admin:components.setting.friend')}
          value={subject?.value?.friend || ''}
          onChange={(e) => handleUpdateSubject(e, 'friend')}
        />

        <Input
          className="col-span-2"
          label={t('admin:components.setting.channel')}
          value={subject?.value?.channel || ''}
          onChange={(e) => handleUpdateSubject(e, 'channel')}
        />

        <Input
          className="col-span-2"
          label={t('admin:components.setting.smsNameCharLimit')}
          value={smsNameCharacterLimit?.value?.toString() || ''}
          disabled
        />

        {state.errorMessage.value && (
          <div className="col-span-full">
            <Text component="h3" className="text-red-700">
              {state.errorMessage.value}
            </Text>
          </div>
        )}

        <div className="col-span-1 grid grid-cols-4 gap-6">
          <Button size="small" className="text-primary col-span-1 bg-theme-highlight" fullWidth onClick={handleCancel}>
            {t('admin:components.common.reset')}
          </Button>
          <Button
            size="small"
            variant="primary"
            className="col-span-1"
            fullWidth
            onClick={handleSubmit}
            startIcon={state.loading.value && <LoadingView spinnerOnly className="h-6 w-6" />}
          >
            {t('admin:components.common.save')}
          </Button>
        </div>
      </div>
    </Accordion>
  )
})

export default EmailTab
