import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiArrowPath } from 'react-icons/hi2'

import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { AvatarService } from '@xrengine/client-core/src/user/services/AvatarService'
import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH } from '@xrengine/common/src/constants/AvatarConstants'
import { AvatarType } from '@xrengine/common/src/schema.type.module'
import { cleanURL } from '@xrengine/common/src/utils/cleanURL'
import { AssetsPreviewPanel } from '@xrengine/editor/src/components/assets/AssetsPreviewPanel'
import { ItemTypes } from '@xrengine/editor/src/constants/AssetTypes'
import { useHookstate } from '@xrengine/hyperflux'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import DragNDrop from '@xrengine/ui/src/primitives/tailwind/DragNDrop'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import Modal from '@xrengine/ui/src/primitives/tailwind/Modal'
import Radios from '@xrengine/ui/src/primitives/tailwind/Radio'

import { getCanvasBlob } from '../../../common/utils'

const getDefaultErrors = () => ({
  serverError: '',
  name: '',
  model: '',
  thumbnail: '',
  modelURL: '',
  thumbnailURL: ''
})

export default function AddEditAvatarModal({ avatar }: { avatar?: AvatarType }) {
  const { t } = useTranslation()
  const previewPanelRef = React.useRef()
  const error = useHookstate(getDefaultErrors())

  const avatarAssets = useHookstate({
    source: 'url' as 'url' | 'file',
    name: avatar?.name || '',
    modelURL: avatar?.modelResource?.url || '',
    thumbnailURL: avatar?.thumbnailResource?.url || '',
    model: undefined as File | undefined,
    thumbnail: undefined as File | undefined
  })

  const isAvatarSet = useHookstate(
    !!(avatarAssets.source.value === 'file' ? avatarAssets.model.value : avatarAssets.modelURL.value)
  )
  const isThumbnailSet = useHookstate(
    !!(avatarAssets.source.value === 'file' ? avatarAssets.thumbnail.value : avatarAssets.thumbnailURL.value)
  )

  useEffect(() => {
    if (avatarAssets.source.value === 'url') {
      isAvatarSet.set(!!avatarAssets.modelURL.value)
      isThumbnailSet.set(!!avatarAssets.thumbnailURL.value)
    } else {
      isAvatarSet.set(!!avatarAssets.model.value)
      isThumbnailSet.set(!!avatarAssets.thumbnail.value)
    }
  }, [
    avatarAssets.source,
    avatarAssets.model,
    avatarAssets.modelURL,
    avatarAssets.thumbnail,
    avatarAssets.thumbnailURL
  ])

  const handleSubmit = async () => {
    error.set(getDefaultErrors())

    if (!avatarAssets.name.value) {
      error.name.set(t('admin:components.avatar.nameCantEmpty'))
    }

    let avatarFile: File | undefined = undefined
    let avatarThumbnail: File | undefined = undefined

    if (avatarAssets.source.value === 'file') {
      if (!avatarAssets.model.value) {
        error.model.set(t('admin:components.avatar.avatarFileCantEmpty'))
      }
      if (!avatarAssets.thumbnail.value) {
        error.thumbnail.set(t('admin:components.avatar.thumbnailFileCantEmpty'))
      }
    } else {
      if (!avatarAssets.modelURL.value) {
        error.modelURL.set(t('admin:components.avatar.avatarUrlCantEmpty'))
      }
      if (!avatarAssets.thumbnailURL.value) {
        error.thumbnailURL.set(t('admin:components.avatar.thumbnailUrlCantEmpty'))
      }
    }

    if (avatarAssets.source.value === 'file') {
      avatarFile = avatarAssets.model.value
      avatarThumbnail = avatarAssets.thumbnail.value
    } else {
      const avatarData = await fetch(avatarAssets.modelURL.value)
      const modelName = cleanURL(avatarAssets.modelURL.value).split('/').pop()!
      avatarFile = new File([await avatarData.blob()], modelName)

      const thumbnailData = await fetch(avatarAssets.thumbnailURL.value)
      const thumbnailName = cleanURL(avatarAssets.thumbnailURL.value).split('/').pop()!
      avatarThumbnail = new File([await thumbnailData.blob()], thumbnailName)
    }

    if (Object.values(error.value).some((value) => value.length > 0)) {
      return
    }

    if (avatarFile && avatarThumbnail) {
      if (avatar?.id) {
        try {
          await AvatarService.patchAvatar(avatar, avatarAssets.name.value, true, avatarFile, avatarThumbnail)
          PopoverState.hidePopupover()
        } catch (e) {
          error.serverError.set(e.message)
        }
      } else {
        try {
          await AvatarService.createAvatar(avatarFile, avatarThumbnail, avatarAssets.name.value, true)
          PopoverState.hidePopupover()
        } catch (e) {
          error.serverError.set(e.message)
        }
      }
    }
  }

  useEffect(() => {
    if (!avatarAssets.model.value || avatarAssets.source.value !== 'file') {
      return
    }
    const modelType = avatarAssets.model.value.name.split('.').pop()

    ;(previewPanelRef as any).current?.onSelectionChanged({
      name: avatarAssets.model.value!.name,
      resourceUrl: URL.createObjectURL(avatarAssets.model.value) + '#' + avatarAssets.model.value.name,
      contentType: `model/${modelType}`
    })
  }, [avatarAssets.model])

  useEffect(() => {
    if (!avatarAssets.modelURL.value || avatarAssets.source.value !== 'url') return
    const modelURL = cleanURL(avatarAssets.modelURL.value)
    const modelName = modelURL.split('/').pop()
    const modelType = modelURL.split('.').pop()
    if (!modelName || !modelType) return
    ;(previewPanelRef as any).current?.onSelectionChanged({
      name: modelName,
      resourceUrl: modelURL,
      contentType: `model/${modelType}`
    })
  }, [avatarAssets.modelURL])

  const clearAvatar = () => {
    if (avatarAssets.source.value === 'file') {
      avatarAssets.model.set(undefined)
    } else {
      avatarAssets.modelURL.set('')
    }
    ;(previewPanelRef as any).current?.onSelectionChanged({
      name: '',
      resourceUrl: '',
      contentType: 'model/glb'
    })
  }

  const clearThumbnail = () => {
    if (avatarAssets.source.value === 'file') {
      avatarAssets.thumbnail.set(undefined)
    } else {
      avatarAssets.thumbnailURL.set('')
    }
  }

  const handleGenerateThumbnail = async () => {
    const canvas = document.createElement('canvas')
    canvas.width = THUMBNAIL_WIDTH
    canvas.height = THUMBNAIL_HEIGHT

    const avatarCanvas = document.evaluate("//div[@id='avatar-drop-zone']//canvas", document, null, 9, null)
      ?.singleNodeValue as CanvasImageSource
    if (!avatarCanvas) return

    const newContext = canvas.getContext('2d')
    newContext?.drawImage(avatarCanvas, 0, 0, canvas.width, canvas.height)

    const blob = await getCanvasBlob(canvas)
    if (avatarAssets.source.value === 'file') {
      avatarAssets.merge({ thumbnail: new File([blob!], 'thumbnail.png') })
    } else {
      avatarAssets.merge({ thumbnailURL: URL.createObjectURL(blob!) })
    }
  }

  return (
    <Modal
      title={avatar?.id ? t('admin:components.avatar.update') : t('admin:components.avatar.add')}
      className="w-[50vw]"
      onSubmit={handleSubmit}
      onClose={PopoverState.hidePopupover}
      submitButtonDisabled={
        avatarAssets.name.value.length === 0 ||
        (avatarAssets.source.value === 'file' && (!avatarAssets.model.value || !avatarAssets.thumbnail.value)) ||
        (avatarAssets.source.value === 'url' && (!avatarAssets.modelURL.value || !avatarAssets.thumbnailURL.value))
      }
    >
      <div className="grid gap-6">
        {error.value && <p className="mt-2 text-red-700">{error.serverError.value}</p>}
        <Input
          label={t('admin:components.common.name')}
          value={avatarAssets.name.value}
          onChange={(event) => avatarAssets.name.set(event.target.value)}
          error={error.name.value}
        />
        <Radios
          value={avatarAssets.source.value}
          options={[
            { label: 'URL', value: 'url' },
            { label: 'File', value: 'file' }
          ]}
          horizontal
          className="w-fit"
          onChange={(value) => avatarAssets.source.set(value)}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="col-span-1">
          {avatarAssets.source.value === 'url' && (
            <Input
              label={t('admin:components.avatar.avatarUrl')}
              value={avatarAssets.modelURL.value}
              onChange={(event) => avatarAssets.modelURL.set(event.target.value)}
              spellCheck={false}
              error={error.modelURL.value}
            />
          )}
          <DragNDrop
            onDropEvent={(files) => {
              avatarAssets.model.set(files[0])
            }}
            acceptedDropTypes={ItemTypes.Models}
            className={`relative mt-5 h-64 ${
              avatarAssets.model.value || avatarAssets.source.value === 'url' ? 'border-solid' : ''
            }`}
            acceptInput={!isAvatarSet.value && avatarAssets.source.value === 'file'}
            externalChildren={
              <>
                {error.model.value && (
                  <p className="absolute right-2 top-2 max-w-[50%] text-wrap text-red-700">{error.model.value}</p>
                )}
                {avatarAssets.source.value === 'file' && (
                  <Button
                    disabled={!avatarAssets.model.value}
                    startIcon={<HiArrowPath />}
                    onClick={clearAvatar}
                    className="absolute left-2 top-2"
                  >
                    {t('admin:components.avatar.clearAvatar')}
                  </Button>
                )}
              </>
            }
            id="avatar-drop-zone"
          >
            <AssetsPreviewPanel
              ref={previewPanelRef}
              previewPanelProps={{
                style: {
                  width: isAvatarSet.value ? 'auto' : '0',
                  aspectRatio: '1/1'
                }
              }}
            />
            {!isAvatarSet.value && (
              <span className="z-20 w-full text-center">
                {avatarAssets.source.value === 'file'
                  ? t('admin:components.avatar.uploadAvatar')
                  : t('admin:components.avatar.avatarUrlPreview')}
              </span>
            )}
          </DragNDrop>
        </div>

        <div className="col-span-1">
          {avatarAssets.source.value === 'url' && (
            <Input
              label={t('admin:components.avatar.thumbnailUrl')}
              value={avatarAssets.thumbnailURL.value}
              onChange={(event) => avatarAssets.thumbnailURL.set(event.target.value)}
              spellCheck={false}
              error={error.thumbnailURL.value}
            />
          )}
          <DragNDrop
            onDropEvent={(files) => {
              avatarAssets.thumbnail.set(files[0])
            }}
            acceptedDropTypes={ItemTypes.Images}
            className={`relative mt-5 h-64 ${
              avatarAssets.thumbnail.value || avatarAssets.source.value === 'url' ? 'border-solid' : ''
            }`}
            acceptInput={!isThumbnailSet.value && avatarAssets.source.value === 'file'}
            externalChildren={
              <>
                {error.thumbnail.value && (
                  <p className="absolute right-2 top-2 max-w-[50%] text-wrap text-red-700">{error.thumbnail.value}</p>
                )}
                {avatarAssets.source.value === 'file' && (
                  <Button
                    disabled={!avatarAssets.thumbnail.value}
                    startIcon={<HiArrowPath />}
                    onClick={clearThumbnail}
                    className="absolute left-2 top-2"
                  >
                    {t('admin:components.avatar.clearThumbnail')}
                  </Button>
                )}
              </>
            }
          >
            {isThumbnailSet.value ? (
              <img
                className="mx-auto max-h-full max-w-full"
                src={
                  avatarAssets.source.value === 'url'
                    ? avatarAssets.thumbnailURL.value
                    : avatarAssets.thumbnail.value
                    ? URL.createObjectURL(avatarAssets.thumbnail.value)
                    : ''
                }
                alt={t('admin:components.avatar.columns.thumbnail')}
              />
            ) : (
              <span className="w-full text-center">
                {avatarAssets.source.value === 'file'
                  ? t('admin:components.avatar.uploadThumbnail')
                  : t('admin:components.avatar.thumbnailURLPreview')}
              </span>
            )}
          </DragNDrop>

          <Button
            onClick={handleGenerateThumbnail}
            disabled={
              (avatarAssets.source.value === 'file' && !avatarAssets.model.value) ||
              (avatarAssets.source.value === 'url' && !avatarAssets.modelURL.value)
            }
            className="mt-2"
          >
            Generate Thumbnail
          </Button>
        </div>
      </div>
    </Modal>
  )
}
