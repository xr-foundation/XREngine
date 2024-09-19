
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AudioEffectPlayer } from '@xrengine/engine/src/audio/systems/MediaSystem'
import Icon from '@xrengine/ui/src/primitives/mui/Icon'
import IconButtonWithTooltip from '@xrengine/ui/src/primitives/mui/IconButtonWithTooltip'

import multiLogger from '@xrengine/common/src/logger'
import { clientContextParams } from '../../util/ClientContextState'
import { useShelfStyles } from '../Shelves/useShelfStyles'
import styles from './index.module.scss'

const logger = multiLogger.child({ component: 'client-core:FullScreen', modifier: clientContextParams })

export const Fullscreen = () => {
  const { t } = useTranslation()
  const [fullScreenActive, setFullScreenActive] = useState(false)
  const { bottomShelfStyle } = useShelfStyles()

  useEffect(() => {
    const onFullScreenChange = () => {
      if (document.fullscreenElement) {
        setFullScreenActive(true)
        logger.info({ event_name: 'view_fullscreen', event_value: true })
      } else {
        setFullScreenActive(false)
        logger.info({ event_name: 'view_fullscreen', event_value: false })
      }
    }

    document.addEventListener('fullscreenchange', onFullScreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', onFullScreenChange)
    }
  }, [])

  const setFullscreen = (input: boolean) => {
    if (input) document.body.requestFullscreen()
    else document.exitFullscreen()
  }

  return (
    <div className={styles.fullScreen}>
      {fullScreenActive ? (
        <IconButtonWithTooltip
          title={t('user:menu.exitFullScreen')}
          className={`${styles.btn} ${bottomShelfStyle}`}
          background="white"
          onClick={() => setFullscreen(false)}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          icon={<Icon type="FullscreenExit" />}
        />
      ) : (
        <IconButtonWithTooltip
          title={t('user:menu.enterFullScreen')}
          className={`${styles.btn} ${bottomShelfStyle}`}
          background="white"
          onClick={() => setFullscreen(true)}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          icon={<Icon type="ZoomOutMap" />}
        />
      )}
    </div>
  )
}
