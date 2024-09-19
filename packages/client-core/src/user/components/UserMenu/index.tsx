
import { ClickAwayListener } from '@mui/material'
import React from 'react'

import { getState, useMutableState } from '@xrengine/hyperflux'
import IconButtonWithTooltip from '@xrengine/ui/src/primitives/mui/IconButtonWithTooltip'

import { AppState } from '../../../common/services/AppService'
import { useShelfStyles } from '../../../components/Shelves/useShelfStyles'
import styles from './index.module.scss'
import { PopupMenuServices, PopupMenuState } from './PopupMenuService'

export const UserMenu = () => {
  const popupMenuState = useMutableState(PopupMenuState)
  const popupMenu = getState(PopupMenuState)
  const Panel = popupMenu.openMenu ? popupMenu.menus[popupMenu.openMenu] : null
  const hotbarItems = popupMenu.hotbar

  const { bottomShelfStyle } = useShelfStyles()

  return (
    <div>
      <ClickAwayListener onClickAway={() => PopupMenuServices.showPopupMenu()} mouseEvent="onMouseDown">
        <>
          <section
            className={`${styles.hotbarContainer} ${bottomShelfStyle} ${
              popupMenuState.openMenu.value ? styles.fadeOutBottom : ''
            }`}
          >
            <div className={styles.buttonsContainer}>
              {Object.keys(hotbarItems).map((id, index) => {
                const hotbarItem = hotbarItems[id]
                if (!hotbarItem) return null
                return (
                  <IconButtonWithTooltip
                    key={index}
                    type="solid"
                    title={hotbarItem.tooltip}
                    icon={hotbarItem.icon}
                    sizePx={50}
                    onClick={() => {
                      if (getState(AppState).showBottomShelf) PopupMenuServices.showPopupMenu(id)
                    }}
                    sx={{
                      cursor: 'pointer',
                      background: 'var(--iconButtonBackground)'
                    }}
                  />
                )
              })}
            </div>
          </section>
          {Panel && <Panel {...popupMenu.params} />}
        </>
      </ClickAwayListener>
    </div>
  )
}
