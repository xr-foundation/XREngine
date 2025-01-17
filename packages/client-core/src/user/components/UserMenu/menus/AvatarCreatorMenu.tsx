
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import AvatarPreview from '@xrengine/client-core/src/common/components/AvatarPreview'
import InputText from '@xrengine/client-core/src/common/components/InputText'
import Menu from '@xrengine/client-core/src/common/components/Menu'
import { getCanvasBlob } from '@xrengine/client-core/src/common/utils'
import config from '@xrengine/common/src/config'
import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH } from '@xrengine/common/src/constants/AvatarConstants'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { AssetExt } from '@xrengine/engine/src/assets/constants/AssetType'
import Box from '@xrengine/ui/src/primitives/mui/Box'
import Icon from '@xrengine/ui/src/primitives/mui/Icon'
import IconButton from '@xrengine/ui/src/primitives/mui/IconButton'
import LoadingView from '@xrengine/ui/src/primitives/tailwind/LoadingView'

import { AVATAR_ID_REGEX, generateAvatarId } from '../../../../util/avatarIdFunctions'
import { AvatarService } from '../../../services/AvatarService'
import { UserMenus } from '../../../UserUISystem'
import styles from '../index.module.scss'
import { PopupMenuServices } from '../PopupMenuService'

export const isAvaturn = (url: string) => {
  const fileExtensionRegex = /\.[0-9a-z]+$/i
  const avaturnUrl = config.client.avaturnUrl
  if (avaturnUrl && !fileExtensionRegex.test(url)) return url.startsWith(avaturnUrl)
  return false
}

enum LoadingState {
  None,
  LoadingCreator,
  Downloading,
  LoadingPreview,
  Uploading
}

export const SupportedSdks = {
  Avaturn: 'Avaturn',
  ReadyPlayerMe: 'ReadyPlayerMe'
}

const AvatarCreatorMenu = (selectedSdk: string) => () => {
  const { t } = useTranslation()
  const [selectedBlob, setSelectedBlob] = useState<Blob>()
  const [avatarName, setAvatarName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(LoadingState.LoadingCreator)
  const [error, setError] = useState('')

  useEffect(() => {
    window.addEventListener('message', handleMessageEvent)
    return () => {
      window.removeEventListener('message', handleMessageEvent)
    }
  }, [avatarUrl])

  const getSdkUrl = () => {
    switch (selectedSdk) {
      case SupportedSdks.Avaturn:
        return config.client.avaturnUrl
      case SupportedSdks.ReadyPlayerMe:
      default:
        return config.client.readyPlayerMeUrl
    }
  }

  const handleReadyPlayerMeMessageEvent = async (event) => {
    const url = event.data
    const avatarIdRegexExec = AVATAR_ID_REGEX.exec(url)

    if (url && url.toString().toLowerCase().startsWith('http')) {
      setLoading(LoadingState.Downloading)
      setError('')
      setAvatarName(avatarIdRegexExec ? avatarIdRegexExec[1] : generateAvatarId())

      try {
        const assetType = AssetLoader.getAssetType(url) ?? isAvaturn(url) ? AssetExt.GLB : null
        if (assetType) {
          const res = await fetch(url)
          const data = await res.blob()

          setLoading(LoadingState.LoadingPreview)
          setAvatarUrl(url)
          setSelectedBlob(data)
        }
      } catch (error) {
        console.error(error)
        setError(t('user:usermenu.avatar.selectValidFile'))
        setLoading(LoadingState.None)
      }
    }
  }

  const handleAvaturnMessageEvent = async (event) => {
    const response = event.data
    let json
    try {
      json = JSON.parse(response)
    } catch (error) {
      console.log('Error parsing the event data.')
      return
    }

    if (json.source !== 'avaturn') return // always check the source its always 'avaturn'

    // Get avatar GLB URL
    if (json.eventName === 'v2.avatar.exported') {
      const url = json.data.url
      const avatarIdRegexExec = AVATAR_ID_REGEX.exec(url)
      if (url && url.toString().toLowerCase().startsWith('http')) {
        setLoading(LoadingState.Downloading)
        setError('')
        setAvatarName(avatarIdRegexExec ? avatarIdRegexExec[1] : generateAvatarId())

        try {
          const res = await fetch(url)
          const data = await res.blob()
          setLoading(LoadingState.LoadingPreview)
          setAvatarUrl(url)
          setSelectedBlob(data)
        } catch (error) {
          console.error(error)
          setError(t('user:usermenu.avatar.selectValidFile'))
          setLoading(LoadingState.None)
        }
      }
    }
  }

  const handleMessageEvent = async (event) => {
    switch (selectedSdk) {
      case SupportedSdks.Avaturn:
        handleAvaturnMessageEvent(event)
        break
      case SupportedSdks.ReadyPlayerMe:
      default:
        handleReadyPlayerMeMessageEvent(event)
    }
  }

  const handleNameChange = (e) => {
    const { value } = e.target

    setError(value.length < 2 ? t('admin:components.avatar.nameRequired') : '')
    setAvatarName(value)
  }

  const uploadAvatar = async () => {
    if (error || selectedBlob === undefined) {
      return
    }
    setLoading(LoadingState.Uploading)

    const canvas = document.createElement('canvas')
    canvas.width = THUMBNAIL_WIDTH
    canvas.height = THUMBNAIL_HEIGHT

    const avatarCanvas = document.getElementById('stage')?.firstChild as CanvasImageSource

    const newContext = canvas.getContext('2d')
    newContext?.drawImage(avatarCanvas, 0, 0)

    const thumbnailName = avatarUrl.substring(0, avatarUrl.lastIndexOf('.')) + '.png'
    const modelName = !isAvaturn(avatarUrl)
      ? avatarUrl.substring(0, avatarUrl.lastIndexOf('.')) + '.glb'
      : avatarUrl.split('/').pop() + '.glb'

    const blob = await getCanvasBlob(canvas)

    await AvatarService.createAvatar(
      new File([selectedBlob!], modelName),
      new File([blob!], thumbnailName),
      avatarName,
      false
    )

    setLoading(LoadingState.None)
    PopupMenuServices.showPopupMenu()
  }

  const avatarPreviewLoaded = loading === LoadingState.None && selectedBlob

  return (
    <Menu
      open
      maxWidth={loading === LoadingState.LoadingCreator ? 'sm' : 'xs'}
      showBackButton={avatarPreviewLoaded ? true : false}
      title={avatarPreviewLoaded ? t('user:avatar.titleSelectThumbnail') : undefined}
      onBack={() => PopupMenuServices.showPopupMenu(UserMenus.Profile)}
      onClose={() => PopupMenuServices.showPopupMenu()}
    >
      <Box
        className={styles.menuContent}
        sx={{ minHeight: loading === LoadingState.LoadingCreator ? '450px !important' : '370px !important' }}
      >
        {loading !== LoadingState.None && (
          <LoadingView
            className="h-6 w-6"
            title={
              loading === LoadingState.Downloading
                ? t('user:avatar.downloading')
                : loading === LoadingState.LoadingPreview
                ? t('user:avatar.loadingPreview')
                : loading === LoadingState.Uploading
                ? t('user:avatar.uploading')
                : t(`user:avatar.loading${selectedSdk}`)
            }
          />
        )}

        {loading === LoadingState.LoadingCreator && (
          <iframe
            style={{
              position: 'absolute',
              margin: -24,
              width: '100%',
              height: '100%',
              zIndex: 2,
              maxWidth: '100%',
              border: 0
            }}
            src={getSdkUrl()}
          />
        )}

        {avatarPreviewLoaded && (
          <InputText
            name="name"
            label={t('user:avatar.avatarName')}
            value={avatarName}
            error={error}
            sx={{ width: `${THUMBNAIL_WIDTH}px`, m: 'auto', p: '10px 0' }}
            onChange={handleNameChange}
          />
        )}

        {loading !== LoadingState.LoadingCreator && (
          <Box padding="10px 0">
            <AvatarPreview
              avatarUrl={avatarUrl}
              sx={{ width: `${THUMBNAIL_WIDTH}px`, height: `${THUMBNAIL_HEIGHT}px`, m: 'auto' }}
              onAvatarError={(error) => setError(error)}
              onAvatarLoaded={() => setLoading(LoadingState.None)}
            />
          </Box>
        )}

        {avatarPreviewLoaded && (
          <Box display="flex" justifyContent="center" width="100%" margin="10px 0">
            <IconButton icon={<Icon type="Check" />} type="gradient" onClick={uploadAvatar} />
          </Box>
        )}
      </Box>
    </Menu>
  )
}

export default AvatarCreatorMenu
