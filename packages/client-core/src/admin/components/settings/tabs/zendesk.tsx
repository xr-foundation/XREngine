import React, { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

import { useFind, useMutation } from '@xrengine/common'
import { zendeskSettingPath } from '@xrengine/common/src/schema.type.module'
import { useHookstate } from '@xrengine/hyperflux'
import PasswordInput from '@xrengine/ui/src/components/tailwind/PasswordInput'
import Accordion from '@xrengine/ui/src/primitives/tailwind/Accordion'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import LoadingView from '@xrengine/ui/src/primitives/tailwind/LoadingView'

const ZendeskTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()
  const state = useHookstate<{ loading: boolean; errorMessage: string }>({
    loading: false,
    errorMessage: ''
  })
  const id = useHookstate<string | undefined>(undefined)
  const name = useHookstate<string>('')
  const secret = useHookstate<string>('')
  const kid = useHookstate<string>('')
  const zendeskMutation = useMutation(zendeskSettingPath)

  const { data } = useFind(zendeskSettingPath)

  useEffect(() => {
    if (data.length) {
      id.set(data[0].id)
      name.set(data[0].name)
      secret.set(data[0].secret)
      kid.set(data[0].kid)
    }
  }, [data])

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!name.value || !secret.value || !kid.value) return

    state.loading.set(true)
    const setting = {
      name: name.value,
      secret: secret.value,
      kid: kid.value
    }
    const operation = !id.value ? zendeskMutation.create(setting) : zendeskMutation.patch(id.value, setting)
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
      name.set(data[0].name)
      secret.set(data[0].secret)
      kid.set(data[0].kid)
    }
  }

  return (
    <Accordion
      title={t('admin:components.setting.zendesk.header')}
      subtitle={t('admin:components.setting.zendesk.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      <div className="my-6 grid grid-cols-3 gap-6">
        <Input
          className="col-span-1"
          label={t('admin:components.setting.keyName')}
          value={name?.value || ''}
          onChange={(e) => name.set(e.target.value)}
        />

        <PasswordInput
          className="col-span-1"
          label={t('admin:components.setting.secret')}
          value={secret?.value || ''}
          onChange={(e) => secret.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.kid')}
          value={kid?.value || ''}
          onChange={(e) => kid.set(e.target.value)}
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

export default ZendeskTab
