
import React, { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

import { useFind, useMutation } from '@xrengine/common'
import { serverSettingPath } from '@xrengine/common/src/schema.type.module'
import { useHookstate } from '@xrengine/hyperflux'
import Accordion from '@xrengine/ui/src/primitives/tailwind/Accordion'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import LoadingView from '@xrengine/ui/src/primitives/tailwind/LoadingView'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'
import Toggle from '@xrengine/ui/src/primitives/tailwind/Toggle'

const ServerTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()

  const serverSetting = useFind(serverSettingPath).data.at(0)

  const id = serverSetting?.id

  const githubWebhookSecret = useHookstate(serverSetting?.githubWebhookSecret)
  const instanceserverUnreachableTimeoutSeconds = useHookstate(serverSetting?.instanceserverUnreachableTimeoutSeconds)
  const dryRun = useHookstate(true)
  const local = useHookstate(true)

  const state = useHookstate({
    loading: false,
    errorMessage: ''
  })

  const patchServerSetting = useMutation(serverSettingPath).patch

  const handleSubmit = (event) => {
    if (!id) return
    state.loading.set(true)
    patchServerSetting(id, {
      githubWebhookSecret: githubWebhookSecret.value,
      instanceserverUnreachableTimeoutSeconds: instanceserverUnreachableTimeoutSeconds.value
    })
      .then(() => {
        state.set({ loading: false, errorMessage: '' })
      })
      .catch((e) => {
        state.set({ loading: false, errorMessage: e.message })
      })
  }

  const handleCancel = () => {
    githubWebhookSecret.set(serverSetting?.githubWebhookSecret)
  }

  return (
    <Accordion
      title={t('admin:components.setting.server.header')}
      subtitle={t('admin:components.setting.server.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      <div className="mt-6 grid w-full grid-cols-2 gap-4">
        <Input
          containerClassName="col-span-1"
          value={serverSetting?.mode || 'test'}
          label={t('admin:components.setting.mode')}
          disabled
        />

        <Input
          containerClassName="col-span-1"
          label={t('admin:components.setting.storageProvider')}
          value={serverSetting?.storageProvider || ''}
          disabled
        />

        <Input
          containerClassName="col-span-1"
          value={serverSetting?.hostname || 'test'}
          label={t('admin:components.setting.hostName')}
          disabled
        />

        <Input
          containerClassName="col-span-1"
          label={t('admin:components.setting.port')}
          value={serverSetting?.port || ''}
          disabled
        />

        <Input
          containerClassName="col-span-1"
          label={t('admin:components.setting.hub')}
          value={serverSetting?.hub?.endpoint || ''}
          disabled
        />

        <Input
          containerClassName="col-span-1"
          label={t('admin:components.setting.clientHost')}
          value={serverSetting?.clientHost || ''}
          disabled
        />

        <Input
          containerClassName="col-span-1"
          label={t('admin:components.setting.url')}
          value={serverSetting?.url || ''}
          disabled
        />

        <Input
          containerClassName="col-span-1"
          label={t('admin:components.setting.rootDirectory')}
          value={serverSetting?.rootDir || ''}
          disabled
        />

        <Input
          containerClassName="col-span-1"
          label={t('admin:components.setting.certPath')}
          value={serverSetting?.certPath || ''}
          disabled
        />

        <Input
          containerClassName="col-span-1"
          label={t('admin:components.setting.publicDirectory')}
          value={serverSetting?.publicDir || ''}
          disabled
        />

        <Input
          containerClassName="col-span-1"
          label={t('admin:components.setting.keyPath')}
          value={serverSetting?.keyPath || ''}
          disabled
        />

        <Input
          containerClassName="col-span-1"
          label={t('admin:components.setting.nodeModulesDirectory')}
          value={serverSetting?.nodeModulesDir || ''}
          disabled
        />

        <Input
          containerClassName="col-span-1"
          label={t('admin:components.setting.githubWebhookSecret')}
          value={githubWebhookSecret.value || ''}
          onChange={(e) => githubWebhookSecret.set(e.target.value)}
        />

        <Input
          containerClassName="col-span-1"
          label={t('admin:components.setting.localStorageProvider')}
          value={serverSetting?.localStorageProvider || ''}
          disabled
        />

        <Input
          containerClassName="col-span-1"
          label={t('admin:components.setting.releaseName')}
          value={serverSetting?.releaseName || ''}
          disabled
        />

        <Input
          containerClassName="col-span-1"
          label={t('admin:components.setting.instanceserverUnreachableTimeoutSeconds')}
          value={instanceserverUnreachableTimeoutSeconds?.value || ''}
          onChange={(e) => instanceserverUnreachableTimeoutSeconds.set(Number(e.target.value))}
        />

        <div className="col-span-1 mt-5 grid grid-cols-2">
          <Toggle
            className="col-span-1"
            label={t('admin:components.setting.performDryRun')}
            value={dryRun.value}
            disabled
            onChange={(value) => dryRun.set(value)}
          />

          <Toggle
            className="col-span-1"
            label={t('admin:components.setting.local')}
            value={local.value}
            disabled
            onChange={(value) => local.set(value)}
          />
        </div>

        {state.errorMessage.value && (
          <div className="col-span-2">
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

export default ServerTab
