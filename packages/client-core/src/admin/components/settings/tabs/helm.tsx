
import React, { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

import { useFind, useMutation } from '@xrengine/common'
import { helmBuilderVersionPath, helmMainVersionPath, helmSettingPath } from '@xrengine/common/src/schema.type.module'
import { useHookstate } from '@xrengine/hyperflux'
import Accordion from '@xrengine/ui/src/primitives/tailwind/Accordion'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import LoadingView from '@xrengine/ui/src/primitives/tailwind/LoadingView'
import Select from '@xrengine/ui/src/primitives/tailwind/Select'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'

const HelmTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()

  const state = useHookstate({
    loading: false,
    errorMessage: ''
  })

  const helmSetting = useFind(helmSettingPath).data.at(0)
  const id = helmSetting?.id
  const selectedMainVersion = useHookstate(helmSetting?.main)

  const helmMainVersions = useFind(helmMainVersionPath).data
  const mainVersionMenu = helmMainVersions.map((el) => {
    return {
      value: el as string,
      label: el
    }
  })

  const helmBuilderVersions = useFind(helmBuilderVersionPath).data
  const selectedBuilderVersion = useHookstate(helmSetting?.builder)
  const builderVersionMenu = helmBuilderVersions.map((el) => {
    return {
      value: el as string,
      label: el
    }
  })

  const patchHelmSetting = useMutation(helmSettingPath).patch
  const handleSubmit = (event) => {
    event.preventDefault()

    if (!id || !selectedMainVersion.value || !selectedBuilderVersion.value) return

    state.loading.set(true)
    patchHelmSetting(id, { main: selectedMainVersion.value, builder: selectedBuilderVersion.value })
      .then(() => {
        state.set({ loading: false, errorMessage: '' })
      })
      .catch((e) => {
        state.set({ loading: false, errorMessage: e.message })
      })
  }

  const handleCancel = () => {
    selectedMainVersion.set(helmSetting?.main)
    selectedBuilderVersion.set(helmSetting?.builder)
  }

  return (
    <Accordion
      title={t('admin:components.setting.helm.header')}
      subtitle={t('admin:components.setting.helm.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      <Text component="p" className="mb-6 mt-2 dark:text-[#A3A3A3]">
        {t('admin:components.setting.helm.subtitle')}
      </Text>

      <div className="mb-6 grid w-full grid-cols-2 gap-2">
        <Select
          label={t('admin:components.setting.helm.main')}
          options={mainVersionMenu}
          onChange={(value) => {
            selectedMainVersion.set(value as string)
          }}
          currentValue={selectedMainVersion.value || ''}
          className="col-span-1"
        />

        <Select
          label={t('admin:components.setting.helm.builder')}
          options={builderVersionMenu}
          onChange={(value) => {
            selectedBuilderVersion.set(value as string)
          }}
          currentValue={selectedBuilderVersion.value || ''}
          className="col-span-1"
        />

        <div className="col-span-1 mt-6 grid grid-cols-4 gap-6">
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
      </div>
    </Accordion>
  )
})

export default HelmTab
