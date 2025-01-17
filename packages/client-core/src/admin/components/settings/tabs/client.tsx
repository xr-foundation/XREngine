
import React, { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

import { clientSettingPath, ClientSettingType } from '@xrengine/common/src/schema.type.module'
import { NO_PROXY, State, useHookstate } from '@xrengine/hyperflux'
import Accordion from '@xrengine/ui/src/primitives/tailwind/Accordion'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import LoadingView from '@xrengine/ui/src/primitives/tailwind/LoadingView'
import Select from '@xrengine/ui/src/primitives/tailwind/Select'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'
import Toggle from '@xrengine/ui/src/primitives/tailwind/Toggle'

import { API, useFind } from '@xrengine/common'

const ClientTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()

  const state = useHookstate({
    loading: false,
    errorMessage: ''
  })

  const clientSettingQuery = useFind(clientSettingPath)
  const clientSettings = clientSettingQuery.data[0] ?? null
  const id = clientSettings?.id

  const settingsState = useHookstate(null as null | ClientSettingType)

  useEffect(() => {
    if (clientSettings) {
      settingsState.set(clientSettings)
      state.set({ loading: false, errorMessage: '' })
    }
  }, [clientSettings])

  const codecMenu = [
    {
      value: 'VP9',
      label: 'VP9'
    },
    {
      value: 'VP8',
      label: 'VP8'
    },
    {
      value: 'h264',
      label: 'h264'
    }
  ]

  const videoMaxResolutionMenu = [
    {
      value: 'fhd',
      label: t('admin:components.setting.videoFHD')
    },
    {
      value: 'hd',
      label: t('admin:components.setting.videoHD')
    },
    {
      value: 'fwvga',
      label: t('admin:components.setting.videoFWVGA')
    },
    {
      value: 'nhd',
      label: t('admin:components.setting.videoNHD')
    }
  ]

  const handleSubmit = (event) => {
    state.loading.set(true)
    event.preventDefault()
    const newSettings = {
      ...settingsState.get(NO_PROXY),
      homepageLinkButtonEnabled: Boolean(settingsState.value!.homepageLinkButtonEnabled),
      createdAt: undefined!,
      updatedAt: undefined!
    } as any as ClientSettingType

    API.instance
      .service(clientSettingPath)
      .patch(id, newSettings)
      .then(() => {
        state.set({ loading: false, errorMessage: '' })
        clientSettingQuery.refetch()
      })
      .catch((e) => {
        state.set({ loading: false, errorMessage: e.message })
      })
  }

  const handleCancel = () => {
    settingsState.set(clientSettings)
  }

  if (!settingsState.value)
    return <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loading')} />

  const settings = settingsState as State<ClientSettingType>

  return (
    <Accordion
      title={t('admin:components.setting.client.header')}
      subtitle={t('admin:components.setting.client.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Text component="h3" fontSize="xl" fontWeight="semibold" className="col-span-full mb-4">
          {t('admin:components.setting.client.main')}
        </Text>

        <Input
          className="col-span-1"
          label={t('admin:components.setting.appTitle')}
          value={settings.appTitle.value || ''}
          onChange={(e) => settings.appTitle.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.title')}
          value={settings.title.value || ''}
          onChange={(e) => settings.title.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.appSubtitle')}
          value={settings.appSubtitle.value || ''}
          onChange={(e) => settings.appSubtitle.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.shortTitle')}
          value={settings.shortTitle.value || ''}
          onChange={(e) => settings.shortTitle.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.appDescription')}
          value={settings.appDescription.value || ''}
          onChange={(e) => settings.appDescription.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.startPath')}
          value={settings.startPath.value || '/'}
          onChange={(e) => settings.startPath.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.appBackground')}
          value={settings.appBackground.value || ''}
          onChange={(e) => settings.appBackground.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.description')}
          value={settings.siteDescription.value || ''}
          onChange={(e) => settings.siteDescription.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.googleAnalyticsMeasurementId')}
          value={settings.gaMeasurementId.value || ''}
          onChange={(e) => settings.gaMeasurementId.set(e.target.value)}
        />
        <Input
          className="col-span-1"
          label={t('admin:components.setting.googleTagManagerContainerId')}
          value={settings.gtmContainerId.value || ''}
          onChange={(e) => settings.gtmContainerId.set(e.target.value)}
        />
        <Input
          className="col-span-1"
          label={t('admin:components.setting.googleTagManagerAuth')}
          description={t('admin:components.setting.googleTagManagerAuthDescription')}
          value={settings.gtmAuth.value || ''}
          onChange={(e) => settings.gtmAuth.set(e.target.value)}
        />
        <Input
          className="col-span-1"
          label={t('admin:components.setting.googleTagManagerPreview')}
          description={t('admin:components.setting.googleTagManagerPreviewDescription')}
          value={settings.gtmPreview.value || ''}
          onChange={(e) => settings.gtmPreview.set(e.target.value)}
        />

        <Toggle
          containerClassName="justify-start col-span-full"
          label={t('admin:components.setting.homepageLinkButtonEnabled')}
          value={settings.homepageLinkButtonEnabled.value}
          onChange={(value) => settings.homepageLinkButtonEnabled.set(value)}
        />

        <Text component="h3" fontSize="xl" fontWeight="semibold" className="col-span-full my-4">
          {t('admin:components.setting.client.logo')}
        </Text>

        <Input
          className="col-span-1"
          label={t('admin:components.setting.logo')}
          value={settings.logo.value || ''}
          onChange={(e) => settings.logo.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.appleTouchIcon')}
          value={settings.appleTouchIcon.value || ''}
          onChange={(e) => settings.appleTouchIcon.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.favIcon16px')}
          value={settings.favicon16px.value || ''}
          onChange={(e) => settings.favicon16px.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.favIcon32px')}
          value={settings.favicon32px.value || ''}
          onChange={(e) => settings.favicon32px.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.icon192px')}
          value={settings.icon192px.value || ''}
          onChange={(e) => settings.icon192px.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.icon512px')}
          value={settings.icon512px.value || ''}
          onChange={(e) => settings.icon512px.set(e.target.value)}
        />

        <Text component="h3" fontSize="xl" fontWeight="semibold" className="col-span-full my-4">
          {t('admin:components.setting.client.other')}
        </Text>

        <Input
          className="col-span-1"
          label={t('admin:components.setting.webmanifestLink')}
          value={settings.webmanifestLink.value || ''}
          onChange={(e) => settings.webmanifestLink.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.swScriptLink')}
          value={settings.swScriptLink.value || ''}
          onChange={(e) => settings.swScriptLink.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.url')}
          value={clientSettings?.url || ''}
          disabled
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.releaseName')}
          value={clientSettings?.releaseName || ''}
          disabled
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.privacyPolicy')}
          value={settings.privacyPolicy.value}
          onChange={(e) => settings.privacyPolicy.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.key8thWall')}
          value={settings.key8thWall.value || ''}
          onChange={(e) => settings.key8thWall.set(e.target.value)}
        />

        <Text component="h3" fontSize="xl" fontWeight="semibold" className="col-span-full my-4">
          {t('admin:components.setting.client.media')}
        </Text>

        <Input
          className="col-span-1"
          type="number"
          label={t('admin:components.setting.audioMaxBitrate')}
          value={settings.mediaSettings.audio.maxBitrate.value || ''}
          onChange={(e) => settings.mediaSettings.audio.maxBitrate.set(Number(e.target.value))}
        />

        <Select
          className="col-span-1"
          label={t('admin:components.setting.videoMaxResolution')}
          currentValue={settings.mediaSettings.video.maxResolution.value}
          options={videoMaxResolutionMenu}
          onChange={(value) => settings.mediaSettings.video.maxResolution.set(value)}
        />

        <Select
          className="col-span-1"
          label={t('admin:components.setting.videoCodec')}
          currentValue={settings.mediaSettings.video.codec.value}
          options={codecMenu}
          onChange={(value) => settings.mediaSettings.video.codec.set(value)}
        />

        {(settings.mediaSettings.video.codec.value === 'VP8' ||
          settings.mediaSettings.video.codec.value === 'h264') && (
          <>
            <Input
              className="col-span-1"
              type="number"
              label={t('admin:components.setting.videoLowResMaxBitrate')}
              value={settings.mediaSettings.video.lowResMaxBitrate.value || ''}
              onChange={(e) => settings.mediaSettings.video.lowResMaxBitrate.set(Number(e.target.value))}
            />

            <Input
              className="col-span-1"
              type="number"
              label={t('admin:components.setting.videoMidResMaxBitrate')}
              value={settings.mediaSettings.video.midResMaxBitrate.value || ''}
              onChange={(e) => settings.mediaSettings.video.midResMaxBitrate.set(Number(e.target.value))}
            />

            <Input
              className="col-span-1"
              type="number"
              label={t('admin:components.setting.videoHighResMaxBitrate')}
              value={settings.mediaSettings.video.highResMaxBitrate.value || ''}
              onChange={(e) => settings.mediaSettings.video.highResMaxBitrate.set(Number(e.target.value))}
            />
          </>
        )}

        <Select
          className="col-span-1"
          label={t('admin:components.setting.screenshareCodec')}
          currentValue={settings.mediaSettings.screenshare.codec.value}
          options={codecMenu}
          onChange={(value) => settings.mediaSettings.screenshare.codec.set(value)}
        />

        {(settings.mediaSettings.screenshare.codec.value === 'VP8' ||
          settings.mediaSettings.screenshare.codec.value === 'h264') && (
          <>
            <Input
              type="number"
              label={t('admin:components.setting.screenshareLowResMaxBitrate')}
              value={settings.mediaSettings.screenshare.lowResMaxBitrate.value || ''}
              onChange={(e) => settings.mediaSettings.screenshare.lowResMaxBitrate.set(Number(e.target.value))}
            />

            <Input
              type="number"
              label={t('admin:components.setting.screenshareMidResMaxBitrate')}
              value={settings.mediaSettings.screenshare.midResMaxBitrate.value || ''}
              onChange={(e) => settings.mediaSettings.screenshare.midResMaxBitrate.set(Number(e.target.value))}
            />

            <Input
              type="number"
              label={t('admin:components.setting.screenshareHighResMaxBitrate')}
              value={settings.mediaSettings.screenshare.highResMaxBitrate.value || ''}
              onChange={(e) => settings.mediaSettings.screenshare.highResMaxBitrate.set(Number(e.target.value))}
            />
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-8 gap-6">
        <Button size="small" className="text-primary col-span-1 bg-theme-highlight" onClick={handleCancel} fullWidth>
          {t('admin:components.common.reset')}
        </Button>
        <Button
          size="small"
          variant="primary"
          className="col-span-1"
          onClick={handleSubmit}
          startIcon={state.loading.value && <LoadingView spinnerOnly className="h-6 w-6" />}
          fullWidth
        >
          {t('admin:components.common.save')}
        </Button>
      </div>
    </Accordion>
  )
})

export default ClientTab
