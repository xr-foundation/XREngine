import React, { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

import styles from '@xrengine/client-core/src/admin/old-styles/admin.module.scss'
import { NotificationService } from '@xrengine/client-core/src/common/services/NotificationService'

import { PopupMenuState } from '@xrengine/client-core/src/user/components/UserMenu/PopupMenuService'
import config from '@xrengine/common/src/config'
import { getState, useMutableState } from '@xrengine/hyperflux'

import { Box, Button } from '@mui/material'

import ProfileMenu from '@xrengine/client-core/src/user/components/UserMenu/menus/ProfileMenu'
import { UserMenus } from '@xrengine/client-core/src/user/UserUISystem'

import { useFind } from '@xrengine/common'
import { clientSettingPath } from '@xrengine/common/src/schema.type.module'
import './index.scss'

const ROOT_REDIRECT = config.client.rootRedirect

export const HomePage = (): any => {
  const { t } = useTranslation()
  const clientSettingQuery = useFind(clientSettingPath)
  const clientSetting = clientSettingQuery.data[0]
  const popupMenuState = useMutableState(PopupMenuState)
  const popupMenu = getState(PopupMenuState)
  const Panel = popupMenu.openMenu ? popupMenu.menus[popupMenu.openMenu] : null

  useEffect(() => {
    const error = new URL(window.location.href).searchParams.get('error')
    if (error) NotificationService.dispatchNotify(error, { variant: 'error' })
  }, [])

  useEffect(() => {
    if (!popupMenuState.openMenu.value) popupMenuState.openMenu.set(UserMenus.Profile)
  }, [popupMenuState.openMenu, popupMenuState.menus.keys])

  if (ROOT_REDIRECT && ROOT_REDIRECT.length > 0 && ROOT_REDIRECT !== 'false') {
    const redirectParsed = new URL(ROOT_REDIRECT)
    if (redirectParsed.protocol == null) return <Navigate to={ROOT_REDIRECT} />
    else window.location.href = ROOT_REDIRECT
  } else
    return (
      <div className="lander">
        <style>
          {`
            [class*=lander] {
                pointer-events: auto;
            }
          `}
        </style>
        <div className="main-background">
          <div className="img-container">
            {clientSetting?.appBackground && (
              <img
                style={{
                  height: 'auto',
                  maxWidth: '100%'
                }}
                src={clientSetting?.appBackground}
                alt=""
                crossOrigin="anonymous"
              />
            )}
          </div>
        </div>
        <nav className="navbar">
          <div className="logo-section">
            {clientSetting?.appTitle && <object className="lander-logo" data={clientSetting?.appTitle} />}
            <div className="logo-bottom">
              {clientSetting?.appSubtitle && <span className="white-txt">{clientSetting?.appSubtitle}</span>}
            </div>
          </div>
        </nav>
        <div className="main-section">
          <div className="desc">
            {clientSetting?.appDescription && (
              <Trans t={t} i18nKey={clientSetting?.appDescription}>
                <span>{clientSetting?.appDescription}</span>
              </Trans>
            )}
            {Boolean(clientSetting?.homepageLinkButtonEnabled) && (
              <Button
                className={styles.gradientButton + ' ' + styles.forceVaporwave}
                autoFocus
                onClick={() => (window.location.href = clientSetting?.homepageLinkButtonRedirect)}
              >
                {clientSetting?.homepageLinkButtonText}
              </Button>
            )}
          </div>
          <Box sx={{ flex: 1 }}>
            <style>
              {`
                [class*=menu] {
                    position: unset;
                    bottom: 0px;
                    top: 0px;
                    left: 0px;
                    width: 100%;
                    transform: none;
                    pointer-events: auto;
                }
              `}
            </style>
            {Panel && <Panel {...popupMenu.params} isPopover />}
            {popupMenu.openMenu !== UserMenus.Profile && <ProfileMenu isPopover />}
          </Box>
        </div>
        <div className="link-container">
          <div className="link-block">
            {clientSetting?.appSocialLinks?.length > 0 &&
              clientSetting?.appSocialLinks.map((social, index) => (
                <a key={index} target="_blank" className="icon" href={social.link}>
                  <img
                    style={{
                      height: 'auto',
                      maxWidth: '100%'
                    }}
                    src={social.icon}
                    alt=""
                  />
                </a>
              ))}
          </div>
          <div className="logo-bottom">
            {clientSetting?.appSubtitle && <span className="white-txt">{clientSetting?.appSubtitle}</span>}
          </div>
        </div>
      </div>
    )
}

export default HomePage
