
import React from 'react'

import { NotificationService } from '@xrengine/client-core/src/common/services/NotificationService'
import { uploadToFeathersService } from '@xrengine/client-core/src/util/upload'
import { fileBrowserUploadPath } from '@xrengine/common/src/schema.type.module'
import {
  KTX2EncodeArguments,
  KTX2EncodeDefaultArguments
} from '@xrengine/engine/src/assets/constants/CompressionParms'
import { ImmutableArray, useHookstate } from '@xrengine/hyperflux'
import { KTX2Encoder } from '@xrengine/xrui/core/textures/KTX2Encoder'

import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import BooleanInput from '@xrengine/ui/src/components/editor/input/Boolean'
import InputGroup from '@xrengine/ui/src/components/editor/input/Group'
import SelectInput from '@xrengine/ui/src/components/editor/input/Select'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import LoadingView from '@xrengine/ui/src/primitives/tailwind/LoadingView'
import Select from '@xrengine/ui/src/primitives/tailwind/Select'
import Slider from '@xrengine/ui/src/primitives/tailwind/Slider'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'
import { useTranslation } from 'react-i18next'
import { MdClose } from 'react-icons/md'
import { FileDataType } from '../../constants/AssetTypes'

const UASTCFlagOptions = [
  { label: 'Fastest', value: 0 },
  { label: 'Faster', value: 1 },
  { label: 'Default', value: 2 },
  { label: 'Slower', value: 3 },
  { label: 'Very Slow', value: 4 },
  { label: 'Mask', value: 0xf },
  { label: 'UASTC Error', value: 8 },
  { label: 'BC7 Error', value: 16 },
  { label: 'Faster Hints', value: 64 },
  { label: 'Fastest Hints', value: 128 },
  { label: 'Disable Flip and Individual', value: 256 }
]

export default function ImageCompressionPanel({
  selectedFiles,
  refreshDirectory
}: {
  selectedFiles: ImmutableArray<FileDataType>
  refreshDirectory: () => Promise<void>
}) {
  const { t } = useTranslation()

  const compressProperties = useHookstate<KTX2EncodeArguments>(KTX2EncodeDefaultArguments)
  const compressionLoading = useHookstate(false)

  const compressContentInBrowser = async () => {
    compressionLoading.set(true)

    for (const file of selectedFiles) {
      await compressImage(file)
    }
    await refreshDirectory()

    compressionLoading.set(false)
    PopoverState.hidePopupover()
  }

  const compressImage = async (props: FileDataType) => {
    compressProperties.src.set(props.type === 'folder' ? `${props.url}/${props.key}` : props.url)

    const ktx2Encoder = new KTX2Encoder()

    const img = await new Promise<HTMLImageElement>((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = function () {
        resolve(img)
      }
      img.src = compressProperties.src.value
    })

    const canvas = new OffscreenCanvas(img.width, img.height)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)

    const imageData = ctx.getImageData(0, 0, img.width, img.height)

    const data = await ktx2Encoder.encode(imageData, {
      uastc: compressProperties.mode.value === 'UASTC',
      qualityLevel: compressProperties.quality.value,
      mipmaps: compressProperties.mipmaps.value,
      compressionLevel: compressProperties.compressionLevel.value,
      yFlip: compressProperties.flipY.value,
      srgb: !compressProperties.srgb.value,
      uastcFlags: compressProperties.uastcFlags.value,
      normalMap: compressProperties.normalMap.value,
      uastcZstandard: compressProperties.uastcZstandard.value
    })

    const newFileName = props.key.replace(/.*\/(.*)\..*/, '$1') + '.ktx2'
    const path = props.key.replace(/(.*\/).*/, '$1')
    const projectName = props.key.split('/')[1] // TODO: support projects with / in the name
    const relativePath = path.replace('projects/' + projectName + '/', '')

    const file = new File([data], newFileName, { type: 'image/ktx2' })

    try {
      await uploadToFeathersService(fileBrowserUploadPath, [file], {
        args: [
          {
            project: projectName,
            path: relativePath + file.name,
            contentType: file.type
          }
        ]
      }).promise
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }

  let title: string
  if (selectedFiles.length === 1) {
    title = selectedFiles[0].name
  } else {
    title = selectedFiles.length + ' Items'
  }

  return (
    <div className="max-h-[80vh] w-full min-w-[400px] max-w-[680px] overflow-y-auto rounded-xl bg-[#0E0F11]">
      <div className="relative mb-3 flex items-center justify-center px-8 py-3">
        <Text className="leading-6">{t('editor:properties.model.transform.compressImage')}</Text>
        <Button
          variant="outline"
          className="absolute right-0 border-0 dark:bg-transparent dark:text-[#A3A3A3]"
          startIcon={<MdClose />}
          onClick={() => PopoverState.hidePopupover()}
        />
      </div>

      <div className="mx-auto grid w-4/5 min-w-[400px] justify-center gap-y-2">
        <InputGroup
          containerClassName="w-full justify-start flex-nowrap"
          labelClassName="w-24 text-theme-gray3"
          name="mode"
          label={t('editor:properties.model.transform.dst')}
        >
          <Input className="border-theme-input bg-[#141619] px-2 py-1.5" value={title} disabled />
        </InputGroup>
        <div className="w-full border border-[#2B2C30]" />
        <InputGroup
          containerClassName="w-full justify-start flex-nowrap"
          labelClassName="w-20 text-theme-gray3"
          infoClassName="text-theme-gray3"
          name="mode"
          label={t('editor:properties.model.transform.mode')}
          info={t('editor:properties.model.transform.modeTooltip')}
        >
          <Select
            className="w-full"
            inputClassName="px-2 py-0.5 text-theme-input text-sm"
            options={[
              { label: 'ETC1S', value: 'ETC1S' },
              { label: 'UASTC', value: 'UASTC' }
            ]}
            currentValue={compressProperties.mode.value}
            onChange={(val: 'ETC1S' | 'UASTC') => compressProperties.mode.set(val)}
          />
        </InputGroup>
        <InputGroup
          containerClassName="w-full justify-start flex-nowrap"
          labelClassName="w-20 text-theme-gray3"
          infoClassName="text-theme-gray3"
          name="flipY"
          label={t('editor:properties.model.transform.flipY')}
          info={t('editor:properties.model.transform.flipYTooltip')}
        >
          <BooleanInput
            className="bg-[#141619]"
            value={compressProperties.flipY.value}
            onChange={compressProperties.flipY.set}
          />
        </InputGroup>
        <InputGroup
          containerClassName="w-full justify-start flex-nowrap"
          labelClassName="w-20 text-theme-gray3"
          infoClassName="text-theme-gray3"
          name="linear"
          label={t('editor:properties.model.transform.srgb')}
          info={t('editor:properties.model.transform.srgbTooltip')}
        >
          <BooleanInput
            className="bg-[#141619]"
            value={compressProperties.srgb.value}
            onChange={compressProperties.srgb.set}
          />
        </InputGroup>
        <InputGroup
          containerClassName="w-full justify-start flex-nowrap"
          labelClassName="w-20 text-theme-gray3"
          infoClassName="text-theme-gray3"
          name="mipmaps"
          label={t('editor:properties.model.transform.mipmaps')}
          info={t('editor:properties.model.transform.mipmapsTooltip')}
        >
          <BooleanInput
            className="bg-[#141619]"
            value={compressProperties.mipmaps.value}
            onChange={compressProperties.mipmaps.set}
          />
        </InputGroup>
        <InputGroup
          containerClassName="w-full justify-start flex-nowrap"
          labelClassName="w-20 text-theme-gray3"
          infoClassName="text-theme-gray3"
          name="normalMap"
          label={t('editor:properties.model.transform.normalMap')}
          info={t('editor:properties.model.transform.normalMapTooltip')}
        >
          <BooleanInput
            className="bg-[#141619]"
            value={compressProperties.normalMap.value}
            onChange={compressProperties.normalMap.set}
          />
        </InputGroup>
        {compressProperties.mode.value === 'ETC1S' && (
          <>
            <InputGroup
              containerClassName="w-full justify-start flex-nowrap"
              labelClassName="w-20 text-theme-gray3"
              infoClassName="text-theme-gray3"
              name="quality"
              label={t('editor:properties.model.transform.quality')}
              info={t('editor:properties.model.transform.qualityTooltip')}
            >
              <Slider
                className="bg-theme-studio-surface [&::-moz-range-track]:bg-theme-studio-surface"
                width={160}
                value={compressProperties.quality.value}
                onChange={compressProperties.quality.set}
                onRelease={compressProperties.quality.set}
                min={1}
                max={255}
                step={1}
              />
            </InputGroup>
            <InputGroup
              containerClassName="w-full justify-start flex-nowrap"
              labelClassName="w-20 text-theme-gray3"
              infoClassName="text-theme-gray3"
              name="compressionLevel"
              label={t('editor:properties.model.transform.compressionLevel')}
              info={t('editor:properties.model.transform.compressionLevelTooltip')}
            >
              <Slider
                className="bg-theme-studio-surface [&::-moz-range-track]:bg-theme-studio-surface"
                width={160}
                value={compressProperties.compressionLevel.value}
                onChange={compressProperties.compressionLevel.set}
                onRelease={compressProperties.compressionLevel.set}
                min={0}
                max={6}
                step={1}
              />
            </InputGroup>
          </>
        )}
        {compressProperties.mode.value === 'UASTC' && (
          <>
            <InputGroup
              containerClassName="w-full justify-start flex-nowrap"
              labelClassName="w-20 text-theme-gray3"
              infoClassName="text-theme-gray3"
              name="uastcFlags"
              label={t('editor:properties.model.transform.uastcFlags')}
              info={t('editor:properties.model.transform.uastcFlagsTooltip')}
            >
              <SelectInput
                className="w-full"
                options={UASTCFlagOptions}
                value={compressProperties.uastcFlags.value}
                onChange={(val: number) => compressProperties.uastcFlags.set(val)}
              />
            </InputGroup>
            <InputGroup
              containerClassName="w-full justify-start flex-nowrap"
              labelClassName="w-20 text-theme-gray3"
              infoClassName="text-theme-gray3"
              name="uastcZstandard"
              label={t('editor:properties.model.transform.uastcZstandard')}
              info={t('editor:properties.model.transform.uastcZstandardTooltip')}
            >
              <BooleanInput
                className="bg-[#141619]"
                value={compressProperties.uastcZstandard.value}
                onChange={compressProperties.uastcZstandard.set}
              />
            </InputGroup>
          </>
        )}
      </div>

      <div className="mb-6 flex justify-end px-8">
        {compressionLoading.value ? (
          <LoadingView spinnerOnly className="mx-0 h-12 w-12" />
        ) : (
          <Button variant="primary" onClick={compressContentInBrowser}>
            {t('editor:properties.model.transform.compress')}
          </Button>
        )}
      </div>
    </div>
  )
}
