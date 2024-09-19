
import React from 'react'
import { useTranslation } from 'react-i18next'

import { AudioEffectPlayer } from '@xrengine/engine/src/audio/systems/MediaSystem'
import { useMutableState } from '@xrengine/hyperflux'
import Icon from '@xrengine/ui/src/primitives/mui/Icon'
import IconButtonWithTooltip from '@xrengine/ui/src/primitives/mui/IconButtonWithTooltip'

import multiLogger from '@xrengine/common/src/logger'
import { AppState } from '../../common/services/AppService'
import { clientContextParams } from '../../util/ClientContextState'
import styles from './index.module.scss'

const logger = multiLogger.child({ component: 'system:Shelves ', modifier: clientContextParams })

export const Shelves = () => {
  const { t } = useTranslation()

  const appState = useMutableState(AppState)
  const showTopShelf = appState.showTopShelf.value
  const showBottomShelf = appState.showBottomShelf.value

  const handleShowMediaIcons = () => {
    appState.showTopShelf.set((prevValue) => {
      logger.info({ event_name: 'header_show', event_value: !prevValue })
      return !prevValue
    })
  }

  const handleShowBottomIcons = () => {
    appState.showBottomShelf.set((prevValue) => {
      logger.info({ event_name: 'footer_show', event_value: !prevValue })
      return !prevValue
    })
  }

  return (
    <div style={{ pointerEvents: 'auto' }}>
      <IconButtonWithTooltip
        className={`${showTopShelf ? styles.btn : styles.smBtn} ${showTopShelf ? styles.rotate : styles.rotateBack}`}
        tooltipClassName={styles.topIcon}
        title={showTopShelf ? t('user:menu.hide') : t('user:menu.show')}
        onClick={handleShowMediaIcons}
        onPointerDown={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        icon={<Icon type={showTopShelf ? 'KeyboardDoubleArrowUp' : 'KeyboardDoubleArrowDown'} />}
      />
      <IconButtonWithTooltip
        className={`${showBottomShelf ? styles.btn : styles.smBtn} ${
          showBottomShelf ? styles.rotate : styles.rotateBack
        } `}
        tooltipClassName={styles.bottomIcon}
        title={showBottomShelf ? t('user:menu.hide') : t('user:menu.show')}
        onClick={handleShowBottomIcons}
        onPointerDown={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        icon={<Icon type={showBottomShelf ? 'KeyboardDoubleArrowDown' : 'KeyboardDoubleArrowUp'} />}
      />
    </div>
  )
}
