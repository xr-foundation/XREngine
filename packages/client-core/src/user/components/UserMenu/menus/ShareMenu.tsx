
import { FormControl, InputLabel } from '@mui/material'
import { QRCodeSVG } from 'qrcode.react'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@xrengine/client-core/src/common/components/Button'
import commonStyles from '@xrengine/client-core/src/common/components/common.module.scss'
import { OculusIcon } from '@xrengine/client-core/src/common/components/Icons/OculusIcon'
import InputCheck from '@xrengine/client-core/src/common/components/InputCheck'
import InputText from '@xrengine/client-core/src/common/components/InputText'
import Menu from '@xrengine/client-core/src/common/components/Menu'
import { NotificationService } from '@xrengine/client-core/src/common/services/NotificationService'
import multiLogger from '@xrengine/common/src/logger'
import { EMAIL_REGEX, PHONE_REGEX } from '@xrengine/common/src/regex'
import { InviteCode, InviteData } from '@xrengine/common/src/schema.type.module'
import { useMutableState } from '@xrengine/hyperflux'
import { isShareAvailable } from '@xrengine/spatial/src/common/functions/DetectFeatures'
import { EngineState } from '@xrengine/spatial/src/EngineState'
import Box from '@xrengine/ui/src/primitives/mui/Box'
import Icon from '@xrengine/ui/src/primitives/mui/Icon'
import IconButton from '@xrengine/ui/src/primitives/mui/IconButton'
import OutlinedInput from '@xrengine/ui/src/primitives/mui/OutlinedInput'

import { InviteService } from '../../../../social/services/InviteService'
import { AuthState } from '../../../services/AuthService'
import styles from '../index.module.scss'
import { PopupMenuServices } from '../PopupMenuService'

const logger = multiLogger.child({ component: 'client-core:ShareMenu' })

export const useShareMenuHooks = ({ refLink }) => {
  const { t } = useTranslation()
  const [token, setToken] = React.useState('')
  const [isSpectatorMode, setSpectatorMode] = useState<boolean>(false)
  const [shareLink, setShareLink] = useState('')
  const selfUser = useMutableState(AuthState).user.value

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(refLink.current.value)
    NotificationService.dispatchNotify(t('user:usermenu.share.linkCopied'), { variant: 'success' })
  }

  const shareOnApps = () => {
    navigator
      .share({
        title: t('user:usermenu.share.shareTitle'),
        text: t('user:usermenu.share.shareDescription'),
        url: document.location.href
      })
      .then(() => {
        logger.info('Successfully shared')
      })
      .catch((error) => {
        logger.error(error, 'Error during sharing')
        NotificationService.dispatchNotify(t('user:usermenu.share.shareFailed'), { variant: 'error' })
      })
  }

  const packageInvite = async (): Promise<void> => {
    const isEmail = EMAIL_REGEX.test(token)
    const isPhone = PHONE_REGEX.test(token)
    const location = new URL(window.location as any)
    const params = new URLSearchParams(location.search)
    let inviteCode = '' as InviteCode

    const sendData = {
      inviteType: 'instance',
      token: token.length === 8 ? null : token,
      identityProviderType: isEmail ? 'email' : isPhone ? 'sms' : null,
      targetObjectId: params.get('instanceId'),
      deleteOnUse: true
    } as InviteData

    if (token.length === 8) {
      inviteCode = token as InviteCode
    }

    if (isSpectatorMode) {
      sendData.spawnType = 'spectate'
      sendData.spawnDetails = { spectate: selfUser.id }
    } else if (selfUser?.inviteCode) {
      sendData.spawnType = 'inviteCode'
      sendData.spawnDetails = { inviteCode: selfUser.inviteCode }
    }

    InviteService.sendInvite(sendData, inviteCode)
    setToken('')
  }

  const handleChangeToken = (e) => {
    setToken(e.target.value)
  }

  const getInviteLink = () => {
    const location = new URL(window.location as any)
    const params = new URLSearchParams(location.search)
    if (selfUser?.inviteCode != null) {
      params.set('inviteCode', selfUser.inviteCode)
      location.search = params.toString()
      return location.toString()
    } else {
      return location.toString()
    }
  }

  const getSpectateModeUrl = () => {
    const location = new URL(window.location as any)
    const params = new URLSearchParams(location.search)
    params.set('spectate', selfUser.id)
    params.delete('inviteCode')
    location.search = params.toString()
    return location.toString()
  }

  const toggleSpectatorMode = () => {
    setSpectatorMode(!isSpectatorMode)
  }

  useEffect(() => {
    setShareLink(isSpectatorMode ? getSpectateModeUrl() : getInviteLink())
  }, [isSpectatorMode])

  return {
    copyLinkToClipboard,
    shareOnApps,
    packageInvite,
    handleChangeToken,
    token,
    shareLink,
    isSpectatorMode,
    toggleSpectatorMode
  }
}

const ShareMenu = (): JSX.Element => {
  const { t } = useTranslation()
  const refLink = useRef() as React.MutableRefObject<HTMLInputElement>
  const engineState = useMutableState(EngineState)
  const {
    copyLinkToClipboard,
    shareOnApps,
    packageInvite,
    handleChangeToken,
    token,
    shareLink,
    isSpectatorMode,
    toggleSpectatorMode
  } = useShareMenuHooks({
    refLink
  })

  // Ref: https://developer.oculus.com/documentation/web/web-launch
  const questShareLink = new URL('https://oculus.com/open_url/')
  questShareLink.searchParams.set('url', shareLink)

  const iframeString = `<iframe src="${window.location.href}" height="100%" width="100%" allow="camera 'src'; microphone 'src';xr-spatial-tracking" style="pointer-events:all;user-select:none;border:none;"></iframe>`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    NotificationService.dispatchNotify(t('user:usermenu.share.linkCopied'), { variant: 'success' })
  }

  return (
    <Menu open title={t('user:usermenu.share.title')} onClose={() => PopupMenuServices.showPopupMenu()}>
      <Box className={styles.menuContent}>
        <Box className={styles.shareQuest}>
          <Button
            className={styles.shareQuestButton}
            endIcon={<OculusIcon sx={{ width: '36px', height: '36px', margin: '-7px 0 -5px -7px' }} />}
            type="gradientRounded"
            onClick={() => window.open(questShareLink, '_blank')}
          >
            {t('user:usermenu.share.shareQuest')}
          </Button>
          <IconButton
            icon={<Icon type="FileCopy" sx={{ width: '18px' }} />}
            sizePx={35}
            onClick={() => copyToClipboard(questShareLink.toString())}
          />
        </Box>

        <div className={styles.QRContainer}>
          <QRCodeSVG height={176} width={200} value={shareLink} />
        </div>

        <InputCheck
          label={t('user:usermenu.share.lbl-spectator-mode')}
          checked={isSpectatorMode}
          onChange={toggleSpectatorMode}
        />

        <InputText
          endIcon={<Icon type="ContentCopy" />}
          inputRef={refLink}
          label={t('user:usermenu.share.shareDirect')}
          sx={{ mt: 2, mb: 3 }}
          value={shareLink}
          onEndIconClick={copyLinkToClipboard}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2, mb: 3 }}>
          <Box sx={{ display: 'flex' }}>
            <FormControl
              variant="outlined"
              className={`${commonStyles.inputField}`}
              disabled={true}
              focused={true}
              size="small"
            >
              <InputLabel sx={{ zIndex: 999 }}>{t('user:usermenu.share.shareEmbed')}</InputLabel>
              <OutlinedInput
                disabled={true}
                fullWidth
                label={t('user:usermenu.share.shareEmbed')}
                size={'small'}
                endAdornment={
                  <IconButton
                    className={styles.iconButton}
                    icon={<Icon type="ContentCopy" />}
                    sx={{ mr: -1.5 }}
                    onClick={() => copyToClipboard(iframeString)}
                  />
                }
                value={iframeString}
              />
            </FormControl>
          </Box>
        </Box>

        <InputText
          endIcon={<Icon type="Send" />}
          label={t('user:usermenu.share.shareInvite')}
          placeholder={t('user:usermenu.share.ph-phoneEmail')}
          value={token}
          onChange={(e) => handleChangeToken(e)}
          onEndIconClick={packageInvite}
        />

        {isShareAvailable && (
          <Button fullWidth type="solidRounded" endIcon={<Icon type="IosShare" />} onClick={shareOnApps}>
            {t('user:usermenu.share.lbl-share')}
          </Button>
        )}
      </Box>
    </Menu>
  )
}

export default ShareMenu
