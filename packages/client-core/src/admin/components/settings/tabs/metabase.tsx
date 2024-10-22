
import { useFind, useMutation } from '@xrengine/common'
import { metabaseSettingPath } from '@xrengine/common/src/schema.type.module'
import { useHookstate } from '@xrengine/hyperflux'
import PasswordInput from '@xrengine/ui/src/components/tailwind/PasswordInput'
import Accordion from '@xrengine/ui/src/primitives/tailwind/Accordion'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import LoadingView from '@xrengine/ui/src/primitives/tailwind/LoadingView'
import React, { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

const MetabaseTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()
  const state = useHookstate<{ loading: boolean; errorMessage: string }>({
    loading: false,
    errorMessage: ''
  })
  const id = useHookstate<string | undefined>(undefined)
  const siteUrl = useHookstate('')
  const secretKey = useHookstate('')
  const environment = useHookstate('')
  const expiration = useHookstate(10)
  const crashDashboardId = useHookstate('')
  const metabaseSettingMutation = useMutation(metabaseSettingPath)

  const { data } = useFind(metabaseSettingPath)

  useEffect(() => {
    if (data.length) {
      id.set(data[0].id)
      siteUrl.set(data[0].siteUrl)
      secretKey.set(data[0].secretKey)
      environment.set(data[0].environment)
      expiration.set(data[0].expiration)
      crashDashboardId.set(data[0].crashDashboardId || '')
    }
  }, [data])

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!siteUrl.value || !secretKey.value || !environment.value) return

    state.loading.set(true)

    const setting = {
      siteUrl: siteUrl.value,
      secretKey: secretKey.value,
      environment: environment.value,
      crashDashboardId: crashDashboardId.value
    }

    const operation = !id.value
      ? metabaseSettingMutation.create(setting)
      : metabaseSettingMutation.patch(id.value, setting)
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
      siteUrl.set(data[0].siteUrl)
      secretKey.set(data[0].secretKey)
      environment.set(data[0].environment)
      expiration.set(data[0].expiration)
      crashDashboardId.set(data[0].crashDashboardId || '')
    }
  }

  return (
    <Accordion
      title={t('admin:components.setting.metabase.header')}
      subtitle={t('admin:components.setting.metabase.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      <div className="my-6 grid grid-cols-3 gap-6">
        <Input
          className="col-span-1"
          label={t('admin:components.setting.metabase.siteUrl')}
          value={siteUrl?.value || ''}
          onChange={(e) => siteUrl.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.metabase.environment')}
          value={environment?.value || ''}
          onChange={(e) => environment.set(e.target.value)}
        />

        <PasswordInput
          className="col-span-1"
          label={t('admin:components.setting.metabase.secretKey')}
          value={secretKey?.value || ''}
          onChange={(e) => secretKey.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          type="number"
          label={t('admin:components.setting.metabase.expiration')}
          value={expiration?.value || 10}
          onChange={(e) => expiration.set(isNaN(parseInt(e.target.value)) ? 10 : parseInt(e.target.value))}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.metabase.crashDashboardId')}
          value={crashDashboardId?.value || ''}
          onChange={(e) => crashDashboardId.set(e.target.value)}
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

export default MetabaseTab
