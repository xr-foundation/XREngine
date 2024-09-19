
import React from 'react'
import { useTranslation } from 'react-i18next'

import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { useMutation } from '@xrengine/common'
import { imageConvertPath } from '@xrengine/common/src/schema.type.module'
import { ImageConvertDefaultParms, ImageConvertParms } from '@xrengine/engine/src/assets/constants/ImageConvertParms'
import { useHookstate } from '@xrengine/hyperflux'
import NumericInput from '@xrengine/ui/src/components/editor/input/Numeric'
import Checkbox from '@xrengine/ui/src/primitives/tailwind/Checkbox'
import Label from '@xrengine/ui/src/primitives/tailwind/Label'
import Modal from '@xrengine/ui/src/primitives/tailwind/Modal'
import Select from '@xrengine/ui/src/primitives/tailwind/Select'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'
import { FileDataType } from '../../../constants/AssetTypes'

export default function ImageConvertModal({
  file,
  refreshDirectory
}: {
  file: FileDataType
  refreshDirectory: () => Promise<void>
}) {
  const { t } = useTranslation()
  const modalProcessing = useHookstate(false)

  const convertProperties = useHookstate<ImageConvertParms>(ImageConvertDefaultParms)
  const imageConvertMutation = useMutation(imageConvertPath)

  const handleSubmit = async () => {
    convertProperties.src.set(file.isFolder ? `${file.url}/${file.key}` : file.url)
    imageConvertMutation
      .create({
        ...convertProperties.value
      })
      .then(() => {
        refreshDirectory()
        PopoverState.hidePopupover()
      })
  }

  return (
    <Modal
      title={t('editor:layout.filebrowser.convert')}
      className="w-[50vw] max-w-2xl"
      onSubmit={handleSubmit}
      onClose={PopoverState.hidePopupover}
      submitLoading={modalProcessing.value}
    >
      <div className="ml-32 flex flex-col gap-4">
        <Text fontWeight="semibold">
          {file.name} {file.isFolder ? t('editor:layout.filebrowser.directory') : t('editor:layout.filebrowser.file')}
        </Text>
        <div className="flex items-center gap-2">
          <Label className="w-16">{t('editor:layout.filebrowser.image-convert.format')}</Label>
          <Select
            inputClassName="px-2 py-0.5 text-theme-input text-sm"
            options={[
              { label: 'PNG', value: 'png' },
              { label: 'JPG', value: 'jpg' },
              { label: 'WEBP', value: 'webp' }
            ]}
            currentValue={convertProperties.format.value}
            onChange={(value) => convertProperties.format.set(value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="w-16">{t('editor:layout.filebrowser.image-convert.resize')}</Label>
          <Checkbox
            className="bg-theme-highlight"
            value={convertProperties.resize.value}
            onChange={(value) => convertProperties.resize.set(value)}
          />
        </div>
        {convertProperties.resize.value && (
          <>
            <div className="flex items-center gap-2">
              <Label className="w-16">{t('editor:layout.filebrowser.image-convert.width')}</Label>
              <NumericInput
                className="w-52 bg-[#141619] px-2 py-0.5"
                value={convertProperties.width.value}
                onChange={(value) => convertProperties.width.set(value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="w-16">{t('editor:layout.filebrowser.image-convert.height')}</Label>
              <NumericInput
                className="w-52 bg-[#141619] px-2 py-0.5"
                value={convertProperties.height.value}
                onChange={(value) => convertProperties.height.set(value)}
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
