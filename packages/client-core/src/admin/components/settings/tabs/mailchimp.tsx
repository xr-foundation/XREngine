
import React, { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

import { useFind, useMutation } from '@xrengine/common'
import { mailchimpSettingPath } from '@xrengine/common/src/schema.type.module'
import { useHookstate } from '@xrengine/hyperflux'
import PasswordInput from '@xrengine/ui/src/components/tailwind/PasswordInput'
import Accordion from '@xrengine/ui/src/primitives/tailwind/Accordion'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import LoadingView from '@xrengine/ui/src/primitives/tailwind/LoadingView'

const MailchimpTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()
  const state = useHookstate<{ loading: boolean; errorMessage: string }>({
    loading: false,
    errorMessage: ''
  })
  const id = useHookstate<string | undefined>(undefined)
  const key = useHookstate<string>('')
  const server = useHookstate<string>('')
  const audienceId = useHookstate<string>('')
  const defaultTags = useHookstate<string>('')
  const mailchimpMutation = useMutation(mailchimpSettingPath)

  const { data } = useFind(mailchimpSettingPath)

  useEffect(() => {
    if (data.length) {
      id.set(data[0].id)
      key.set(data[0].key)
      server.set(data[0].server)
      audienceId.set(data[0].audienceId)
      defaultTags.set(data[0].defaultTags)
    }
  }, [data])

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!key.value || !server.value || !audienceId.value) return

    state.loading.set(true)
    const setting = {
      key: key.value,
      server: server.value,
      audienceId: audienceId.value,
      defaultTags: defaultTags.value
    }
    const operation = !id.value ? mailchimpMutation.create(setting) : mailchimpMutation.patch(id.value, setting)
    operation
      .then(() => {
        state.set({ loading: false, errorMessage: '' })
      })
      .catch((e) => {
        state.set({ loading: false, errorMessage: e.message })
      })
  }

  const handleCancel = () => {
    if (data.length) {
      id.set(data[0].id)
      key.set(data[0].key)
      server.set(data[0].server)
      audienceId.set(data[0].audienceId)
      defaultTags.set(data[0].defaultTags)
    }
  }

  return (
    <Accordion
      title={t('admin:components.setting.mailchimp.header')}
      subtitle={t('admin:components.setting.mailchimp.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      <div className="my-6 grid grid-cols-4 gap-6">
        <PasswordInput
          className="col-span-1"
          label={t('admin:components.setting.mailchimp.key')}
          value={key?.value || ''}
          onChange={(e) => key.set(e.target.value)}
        />
        <Input
          className="col-span-1"
          label={t('admin:components.setting.mailchimp.server')}
          value={server?.value || ''}
          onChange={(e) => server.set(e.target.value)}
        />
        <Input
          className="col-span-1"
          label={t('admin:components.setting.mailchimp.audienceId')}
          value={audienceId?.value || ''}
          onChange={(e) => audienceId.set(e.target.value)}
        />
        <Input
          className="col-span-1"
          label={t('admin:components.setting.mailchimp.defaultTags')}
          value={defaultTags?.value || ''}
          onChange={(e) => defaultTags.set(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-8 gap-6">
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
    </Accordion>
  )
})

export default MailchimpTab
